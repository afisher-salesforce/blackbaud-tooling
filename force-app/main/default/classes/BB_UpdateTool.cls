/**
 * BB_UpdateTool — the agent's (and site's) write action for per-tool commercial
 * data captured during the Blackbaud review: Priority, Contract Maturity date,
 * Users, and Contract Amount on BB_Tool__c.
 *
 * Resolves the tool from a loose reference (exact External_Id__c, exact Name, or
 * a fuzzy/partial term like "Gong") the same way BB_CaptureNote resolves
 * capabilities, then does a NULL-SAFE PARTIAL update — only the fields actually
 * provided are written, so a caller setting just Priority never blanks the others.
 *
 * `with sharing` — writes respect the running user's access; the Einstein Agent
 * User (and the integration user the site BFF runs as) get edit on these 4 fields
 * via the BB_Rationalization_Agent permission set.
 */
global with sharing class BB_UpdateTool {
    global class Request {
        @InvocableVariable(
            required=true
            label='Tool reference'
            description='The tool to update — its External Id, exact name, or a recognizable term (e.g. "Gong").'
        )
        global String toolRef;
        @InvocableVariable(label='Priority' description='High, Medium, or Low')
        global String priority;
        @InvocableVariable(label='Contract maturity date' description='Contract maturity / renewal date (yyyy-MM-dd).')
        global Date contractMaturity;
        @InvocableVariable(label='Users' description='Number of users / seats.')
        global Decimal users;
        @InvocableVariable(label='Contract amount' description='Annual contract value in whole dollars.')
        global Decimal contractAmount;
    }

    global class Response {
        @InvocableVariable
        global Boolean success;
        @InvocableVariable
        global String toolName;
        @InvocableVariable
        global String message;
    }

    @InvocableMethod(
        label='Update Blackbaud Tool'
        description='Sets priority, contract maturity, users, and/or contract amount on a Blackbaud tool.'
    )
    global static List<Response> updateTool(List<Request> requests) {
        List<Response> out = new List<Response>();
        for (Request req : requests) {
            out.add(runOne(req));
        }
        return out;
    }

    static Response runOne(Request req) {
        Response r = new Response();
        if (req == null || String.isBlank(req.toolRef)) {
            r.success = false;
            r.message = 'A tool reference is required.';
            return r;
        }
        BB_Tool__c tool = resolveTool(req.toolRef);
        if (tool == null) {
            r.success = false;
            r.message = 'No tool found matching "' + req.toolRef + '".';
            return r;
        }

        // Null-safe partial update — only set the fields the caller provided.
        Boolean anySet = false;
        if (String.isNotBlank(req.priority)) {
            tool.Priority__c = req.priority;
            anySet = true;
        }
        if (req.contractMaturity != null) {
            tool.Contract_Maturity__c = req.contractMaturity;
            anySet = true;
        }
        if (req.users != null) {
            tool.Users__c = req.users;
            anySet = true;
        }
        if (req.contractAmount != null) {
            tool.Contract_Amount__c = req.contractAmount;
            anySet = true;
        }
        if (!anySet) {
            r.success = false;
            r.toolName = tool.Name;
            r.message = 'No fields provided to update.';
            return r;
        }

        try {
            update tool;
            r.success = true;
            r.toolName = tool.Name;
            r.message = 'Updated ' + tool.Name + '.';
        } catch (DmlException e) {
            r.success = false;
            r.toolName = tool.Name;
            r.message = 'Could not update tool: ' + e.getMessage();
        }
        return r;
    }

    /**
     * Resolve a BB_Tool__c from a loose reference: exact External_Id__c → exact
     * Name → single fuzzy LIKE hit on Name/External_Id__c. Returns null if nothing
     * plausibly and unambiguously matches. (Tool external ids are
     * "slug(tool)--<capabilityId>", so a plain name like "Gong" won't match the
     * external id exactly — the Name match and fuzzy pass handle that.)
     */
    static BB_Tool__c resolveTool(String ref) {
        String key = ref == null ? '' : ref.trim();
        if (String.isBlank(key)) {
            return null;
        }
        List<BB_Tool__c> hits = [
            SELECT Id, Name, Priority__c, Contract_Maturity__c, Users__c, Contract_Amount__c
            FROM BB_Tool__c
            WHERE External_Id__c = :key
            LIMIT 1
        ];
        if (!hits.isEmpty()) {
            return hits[0];
        }
        hits = [
            SELECT Id, Name, Priority__c, Contract_Maturity__c, Users__c, Contract_Amount__c
            FROM BB_Tool__c
            WHERE Name = :key
            LIMIT 2
        ];
        if (hits.size() == 1) {
            return hits[0];
        }
        String likeTerm = '%' + key + '%';
        hits = [
            SELECT Id, Name, Priority__c, Contract_Maturity__c, Users__c, Contract_Amount__c
            FROM BB_Tool__c
            WHERE Name LIKE :likeTerm OR External_Id__c LIKE :likeTerm
            LIMIT 2
        ];
        if (hits.size() == 1) {
            return hits[0];
        }
        return null;
    }
}
