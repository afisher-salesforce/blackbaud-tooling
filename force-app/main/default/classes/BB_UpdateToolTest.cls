@isTest
private class BB_UpdateToolTest {
    @testSetup
    static void setup() {
        BB_Capability__c cap = new BB_Capability__c(
            Name = 'Conversation Intelligence',
            External_Id__c = 'conversation-intelligence',
            Value_Stream__c = 'A2R',
            Alignment__c = 'Partial'
        );
        insert cap;
        insert new BB_Tool__c(
            Name = 'Gong',
            External_Id__c = 'gong--conversation-intelligence',
            Value_Stream__c = 'A2R',
            Capability__c = cap.Id
        );
    }

    @isTest
    static void updatesAllFieldsByExternalId() {
        BB_UpdateTool.Request req = new BB_UpdateTool.Request();
        req.toolRef = 'gong--conversation-intelligence';
        req.priority = 'High';
        req.contractMaturity = Date.newInstance(2027, 3, 1);
        req.users = 500;
        req.contractAmount = 400000;

        Test.startTest();
        List<BB_UpdateTool.Response> res = BB_UpdateTool.updateTool(new List<BB_UpdateTool.Request>{ req });
        Test.stopTest();

        System.assert(res[0].success, 'update should succeed');
        BB_Tool__c t = [SELECT Priority__c, Contract_Maturity__c, Users__c, Contract_Amount__c FROM BB_Tool__c LIMIT 1];
        System.assertEquals('High', t.Priority__c);
        System.assertEquals(Date.newInstance(2027, 3, 1), t.Contract_Maturity__c);
        System.assertEquals(500, t.Users__c);
        System.assertEquals(400000, t.Contract_Amount__c);
    }

    @isTest
    static void fuzzyResolvesPlainName() {
        BB_UpdateTool.Request req = new BB_UpdateTool.Request();
        req.toolRef = 'Gong'; // not the external id
        req.priority = 'Medium';
        List<BB_UpdateTool.Response> res = BB_UpdateTool.updateTool(new List<BB_UpdateTool.Request>{ req });
        System.assert(res[0].success, 'plain name should resolve via Name/fuzzy match');
        System.assertEquals('Medium', [SELECT Priority__c FROM BB_Tool__c LIMIT 1].Priority__c);
    }

    @isTest
    static void partialUpdateDoesNotBlankOthers() {
        // Seed a value, then update only one field; the other must survive.
        BB_Tool__c t = [SELECT Id FROM BB_Tool__c LIMIT 1];
        t.Users__c = 250;
        update t;

        BB_UpdateTool.Request req = new BB_UpdateTool.Request();
        req.toolRef = 'gong--conversation-intelligence';
        req.priority = 'Low'; // only priority provided
        BB_UpdateTool.updateTool(new List<BB_UpdateTool.Request>{ req });

        BB_Tool__c after = [SELECT Priority__c, Users__c FROM BB_Tool__c LIMIT 1];
        System.assertEquals('Low', after.Priority__c);
        System.assertEquals(250, after.Users__c, 'Users must not be blanked by a priority-only update');
    }

    @isTest
    static void unknownToolFails() {
        BB_UpdateTool.Request req = new BB_UpdateTool.Request();
        req.toolRef = 'does-not-exist-zzz';
        req.priority = 'High';
        List<BB_UpdateTool.Response> res = BB_UpdateTool.updateTool(new List<BB_UpdateTool.Request>{ req });
        System.assert(!res[0].success, 'unknown tool should fail');
    }
}
