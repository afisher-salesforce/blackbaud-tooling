@isTest
private class BB_CaptureNoteTest {
    @testSetup
    static void setup() {
        insert new BB_Capability__c(
            Name = 'Forecasting & Pipeline',
            External_Id__c = 'forecasting',
            Value_Stream__c = 'A2R',
            Alignment__c = 'Native'
        );
    }

    @isTest
    static void capturesNoteOnCapability() {
        BB_CaptureNote.Request req = new BB_CaptureNote.Request();
        req.capabilityExternalId = 'forecasting';
        req.note = 'Russ: validate forward-looking conversion analytics vs Clari.';
        req.capturedBy = 'Drew';

        Test.startTest();
        List<BB_CaptureNote.Response> res = BB_CaptureNote.capture(new List<BB_CaptureNote.Request>{ req });
        Test.stopTest();

        System.assert(res[0].success, 'note should be captured');
        List<BB_Alignment_Note__c> notes = [SELECT Note__c, Captured_By__c, Source__c FROM BB_Alignment_Note__c];
        System.assertEquals(1, notes.size(), 'one note inserted');
        System.assertEquals('Drew', notes[0].Captured_By__c);
        System.assertEquals('Agent', notes[0].Source__c);
    }

    @isTest
    static void unknownCapabilityFails() {
        BB_CaptureNote.Request req = new BB_CaptureNote.Request();
        req.capabilityExternalId = 'does-not-exist';
        req.note = 'orphan note';
        List<BB_CaptureNote.Response> res = BB_CaptureNote.capture(new List<BB_CaptureNote.Request>{ req });
        System.assert(!res[0].success, 'should fail for unknown capability');
        System.assertEquals(0, [SELECT COUNT() FROM BB_Alignment_Note__c], 'no note inserted');
    }

    @isTest
    static void missingFieldsFail() {
        BB_CaptureNote.Request req = new BB_CaptureNote.Request();
        req.capabilityExternalId = 'forecasting';
        req.note = '';
        List<BB_CaptureNote.Response> res = BB_CaptureNote.capture(new List<BB_CaptureNote.Request>{ req });
        System.assert(!res[0].success, 'blank note should fail');
    }
}
