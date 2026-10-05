/**
 * BB_CaptureNote — the Rationalization Agent's (gated) write action.
 *
 * Creates a BB_Alignment_Note__c against a capability (by its External_Id__c) so
 * a note the agent captures during a conversation lands in the same system of
 * record the site's reviewer notes use. Write scope is governed at the BFF /
 * agent layer (ALLOW_WRITES); this action simply performs the insert when invoked.
 *
 * `with sharing` — writes respect the running user's access; the Einstein Agent
 * User gets create on BB_Alignment_Note__c via the BB_Rationalization_Agent
 * permission set.
 */
global with sharing class BB_CaptureNote {
    global class Request {
        @InvocableVariable(
            required=true
            label='Capability external id'
            description='The External_Id__c of the capability the note is about (e.g. "forecasting").'
        )
        global String capabilityExternalId;
        @InvocableVariable(required=true label='Note text')
        global String note;
        @InvocableVariable(label='Captured by' description='Reviewer name, or "Agent".')
        global String capturedBy;
    }

    global class Response {
        @InvocableVariable
        global Boolean success;
        @InvocableVariable
        global String noteId;
        @InvocableVariable
        global String message;
    }

    @InvocableMethod(label='Capture Alignment Note' description='Creates a discussion note on a Blackbaud capability.')
    global static List<Response> capture(List<Request> requests) {
        List<Response> out = new List<Response>();
        for (Request req : requests) {
            out.add(runOne(req));
        }
        return out;
    }

    static Response runOne(Request req) {
        Response r = new Response();
        if (req == null || String.isBlank(req.capabilityExternalId) || String.isBlank(req.note)) {
            r.success = false;
            r.message = 'capabilityExternalId and note are required.';
            return r;
        }
        List<BB_Capability__c> caps = [
            SELECT Id
            FROM BB_Capability__c
            WHERE External_Id__c = :req.capabilityExternalId
            LIMIT 1
        ];
        if (caps.isEmpty()) {
            r.success = false;
            r.message = 'No capability found for external id "' + req.capabilityExternalId + '".';
            return r;
        }
        BB_Alignment_Note__c n = new BB_Alignment_Note__c(
            Capability__c = caps[0].Id,
            Note__c = req.note.length() > 8000 ? req.note.substring(0, 8000) : req.note,
            Captured_By__c = String.isBlank(req.capturedBy) ? 'Agent' : req.capturedBy.left(120),
            Captured_At__c = System.now(),
            Source__c = 'Agent'
        );
        try {
            insert n;
            r.success = true;
            r.noteId = n.Id;
            r.message = 'Note captured.';
        } catch (DmlException e) {
            r.success = false;
            r.message = 'Could not save note: ' + e.getMessage();
        }
        return r;
    }
}
