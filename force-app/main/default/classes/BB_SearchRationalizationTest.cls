@isTest
private class BB_SearchRationalizationTest {
    @testSetup
    static void setup() {
        BB_Entitlement__c ent = new BB_Entitlement__c(
            External_Id__c = 'revenue-cloud',
            Name = 'revenue-cloud',
            Products__c = 'Revenue Cloud Advanced - Unlimited (CPQ Upgrade)',
            Status__c = 'owned'
        );
        insert ent;

        BB_Capability__c cap = new BB_Capability__c(
            Name = 'Forecasting & Pipeline',
            External_Id__c = 'forecasting',
            Value_Stream__c = 'A2R',
            Domain__c = 'Revenue Intelligence',
            Alignment__c = 'Native',
            Entitlement_Status__c = 'owned',
            SE_Review__c = 'Blackbaud already owns Collaborative Forecasting; the Clari RFP is for a capability they own.',
            Retire_Candidates__c = 'Clari',
            Primary_Entitlement__c = ent.Id
        );
        insert cap;

        insert new BB_Tool__c(
            Name = 'Clari',
            External_Id__c = 'clari',
            Value_Stream__c = 'A2R',
            Sub_Capability__c = 'Forecasting & Pipeline',
            Capability__c = cap.Id,
            Overlaps_SF__c = true,
            Retire_Candidate__c = true
        );
    }

    @isTest
    static void returnsGroundedAnswerForCapability() {
        Id capId = [SELECT Id FROM BB_Capability__c LIMIT 1].Id;
        Test.setFixedSearchResults(new List<Id>{ capId });

        BB_SearchRationalization.Request req = new BB_SearchRationalization.Request();
        req.query = 'forecasting';

        Test.startTest();
        List<BB_SearchRationalization.Response> res = BB_SearchRationalization.search(
            new List<BB_SearchRationalization.Request>{ req }
        );
        Test.stopTest();

        System.assertEquals(1, res.size(), 'one response expected');
        System.assert(res[0].matchCount >= 1, 'should match at least the capability');
        System.assert(res[0].answer.contains('Forecasting'), 'answer should name the capability');
        System.assertEquals('/capability/forecasting', res[0].topLink, 'relative citation link');
    }

    @isTest
    static void blankQueryIsHandled() {
        BB_SearchRationalization.Request req = new BB_SearchRationalization.Request();
        req.query = '   ';
        List<BB_SearchRationalization.Response> res = BB_SearchRationalization.search(
            new List<BB_SearchRationalization.Request>{ req }
        );
        System.assertEquals(0, res[0].matchCount, 'blank query yields no matches');
    }

    @isTest
    static void noMatchIsHandled() {
        Test.setFixedSearchResults(new List<Id>{});
        BB_SearchRationalization.Request req = new BB_SearchRationalization.Request();
        req.query = 'something totally unrelated zzz';
        Test.startTest();
        List<BB_SearchRationalization.Response> res = BB_SearchRationalization.search(
            new List<BB_SearchRationalization.Request>{ req }
        );
        Test.stopTest();
        System.assertEquals(0, res[0].matchCount, 'no fixed results => no matches');
        System.assert(res[0].answer.contains('No matching'), 'empty-state message');
    }
}
