/**
 * BB_SearchRationalization — the Rationalization Agent's grounding action.
 *
 * Given a free-text query, searches the three grounding objects (BB_Capability__c,
 * BB_Entitlement__c, BB_Tool__c) and returns a compact, agent-ready answer body:
 * the matched capabilities with their SE review (the richest grounding text),
 * alignment, entitlement status, owned products, and retire candidates — plus a
 * relative /capability/<External_Id__c> link the site renders as an in-app
 * citation pill (the DISW SearchDISWKnowledge pattern).
 *
 * `global without sharing` so the agent (running as the Einstein Agent User with
 * the BB_Rationalization_Agent permission set) can read the reference data
 * regardless of org-wide defaults; these objects hold no row-level-sensitive data.
 */
global without sharing class BB_SearchRationalization {
    @TestVisible
    static final Integer MAX_ROWS = 5;
    @TestVisible
    static final Integer BODY_MAX = 1200;

    global class Request {
        @InvocableVariable(
            required=true
            label='Search query'
            description='What the user is asking about — a capability, tool, entitlement, or value stream.'
        )
        global String query;
        @InvocableVariable(label='Value stream filter' description='Optional: A2R or I2R to scope the search.')
        global String valueStream;
    }

    global class Response {
        @InvocableVariable
        global String answer; // assembled grounding text
        @InvocableVariable
        global String topTitle; // best-match capability name
        @InvocableVariable
        global String topLink; // relative /capability/<id> link
        @InvocableVariable
        global Integer matchCount;
    }

    @InvocableMethod(
        label='Search Blackbaud Rationalization'
        description='Searches Blackbaud capabilities, owned Salesforce entitlements, and tooling to ground answers about application rationalization.'
    )
    global static List<Response> search(List<Request> requests) {
        List<Response> out = new List<Response>();
        for (Request req : requests) {
            out.add(runOne(req));
        }
        return out;
    }

    static Response runOne(Request req) {
        Response r = new Response();
        String q = req == null || req.query == null ? '' : req.query.trim();
        if (String.isBlank(q)) {
            r.answer = 'No query provided.';
            r.matchCount = 0;
            return r;
        }

        // SOSL across the grounding objects. FIND is sanitized by the binding.
        String term = sanitizeSosl(q);
        List<List<SObject>> results = Search.query(
            'FIND :term IN ALL FIELDS RETURNING ' +
                'BB_Capability__c(Id, Name, External_Id__c, Value_Stream__c, Domain__c, Alignment__c, Entitlement_Status__c, SF_Products__c, SE_Review__c, Retire_Candidates__c, Primary_Entitlement__r.Products__c, Primary_Entitlement__r.Status__c, Primary_Entitlement__r.Expiry__c ' +
                (String.isBlank(req == null ? null : req.valueStream) ? '' : 'WHERE Value_Stream__c = :vsFilter ') +
                'ORDER BY LastModifiedDate DESC LIMIT 25), ' +
                'BB_Tool__c(Id, Name, Value_Stream__c, Sub_Capability__c, Overlaps_SF__c, Retire_Candidate__c, Capability__r.External_Id__c, Capability__r.Name LIMIT 25), ' +
                'BB_Entitlement__c(Id, Name, Products__c, Status__c, Expiry__c LIMIT 25)'
        );

        List<BB_Capability__c> caps = (List<BB_Capability__c>) results[0];
        List<BB_Tool__c> tools = (List<BB_Tool__c>) results[1];
        List<BB_Entitlement__c> ents = (List<BB_Entitlement__c>) results[2];

        r.matchCount = caps.size() + tools.size() + ents.size();
        if (r.matchCount == 0) {
            r.answer = 'No matching capability, tool, or entitlement was found for "' + q + '".';
            return r;
        }

        String body = assemble(caps, tools, ents);
        r.answer = body.length() > BODY_MAX ? body.substring(0, BODY_MAX) : body;

        if (!caps.isEmpty()) {
            r.topTitle = caps[0].Name;
            r.topLink = '/capability/' + caps[0].External_Id__c;
        } else if (!tools.isEmpty() && tools[0].Capability__r != null) {
            r.topTitle = tools[0].Capability__r.Name;
            r.topLink = '/capability/' + tools[0].Capability__r.External_Id__c;
        }
        return r;
    }

    static String assemble(List<BB_Capability__c> caps, List<BB_Tool__c> tools, List<BB_Entitlement__c> ents) {
        List<String> lines = new List<String>();
        Integer n = 0;
        for (BB_Capability__c c : caps) {
            if (n++ >= MAX_ROWS)
                break;
            String ent = c.Entitlement_Status__c;
            String owned = c.Primary_Entitlement__r != null ? c.Primary_Entitlement__r.Products__c : null;
            String line =
                'CAPABILITY: ' +
                c.Name +
                ' (' +
                c.Value_Stream__c +
                ', ' +
                c.Domain__c +
                ')' +
                ' | Alignment: ' +
                c.Alignment__c +
                ' | Entitlement: ' +
                (String.isBlank(ent) ? 'n/a' : ent) +
                (String.isBlank(owned) ? '' : ' | Owned: ' + owned) +
                (String.isBlank(c.Retire_Candidates__c) ? '' : ' | Could retire: ' + c.Retire_Candidates__c) +
                (String.isBlank(c.SE_Review__c) ? '' : ' | SE view: ' + c.SE_Review__c);
            lines.add(line);
        }
        for (BB_Entitlement__c e : ents) {
            lines.add(
                'OWNED ENTITLEMENT: ' +
                    e.Products__c +
                    ' (status: ' +
                    e.Status__c +
                    (String.isBlank(e.Expiry__c) ? '' : ', expires ' + e.Expiry__c) +
                    ')'
            );
        }
        for (BB_Tool__c t : tools) {
            if (!t.Overlaps_SF__c && !t.Retire_Candidate__c)
                continue;
            lines.add(
                'TOOL: ' +
                    t.Name +
                    ' (' +
                    t.Value_Stream__c +
                    ')' +
                    (t.Retire_Candidate__c ? ' — retire candidate' : '') +
                    (t.Capability__r != null ? ' — serves ' + t.Capability__r.Name : '')
            );
        }
        return String.join(lines, '\n');
    }

    // Escape SOSL reserved characters so a user query can't break the FIND clause.
    static String sanitizeSosl(String s) {
        return s.replaceAll('([\\?&\\|!\\{\\}\\[\\]\\(\\)\\^~\\*:\\\\"\'\\+\\-])', '\\\\$1');
    }
}
