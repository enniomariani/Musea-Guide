import {browser} from 'wdio-electron-service';
import {after} from "mocha";
import {
    createAndSaveSavedMediaStationJSON,
    removeAllSavedFiles,
    setTemporaryContentJSON,
    setupFunctionalMediaStationComunication
} from "./helperFunctions/HelperFunctions.js";
import {
    openMediaStation, restartApp
} from "./helperFunctions/HelperMediaStationScreen.js";
import {createBasicJSON} from "./helperFunctions/HelperCreateContentJSON.js";

process.env.TEST = 'true';

/**
 *
 * GENERAL INFORMATION ABOUT THE TEST-STRUCTURE:
 *
 * - the state of the app remains changed between the tests, except if the describe-text states "New Scenario"
 * - if multiple tests in the same scenario fail: take a look at the first one, it could impact the others!
 */

before("removeSavedMediaStations", () => {
    removeAllSavedFiles();
});

after("removeSavedMediaStations", () => {
    removeAllSavedFiles();
});

describe('Electron Testing', () => {
    it('should print application title', async () => {
        console.log('--- First Test: Hello', await browser.getTitle(), 'application!')
    });
});

describe("Scenario 1: opening a mediastation, it ", () => {
    it('should not open if a mediastation is defined, but it is not reachable', async () => {
        removeAllSavedFiles();
        createAndSaveSavedMediaStationJSON("Medienstation für e2e-Tests - not reachable", "not-reachable");
        await restartApp();

        await $('#item0').click();
        await $('#infoText').waitForDisplayed({reverse: true, timeout: 10000});

        expect(await $('#exitBtn').isDisplayed()).toBe(false);
    });

    it('should NOT open if a mediastation is defined and is reachable and returns an empty json (because no controller-ip defined)', async () => {
        await setupFunctionalMediaStationComunication();

        setTemporaryContentJSON("{}");

        await restartApp();
        await openMediaStation(0, false);

        expect(await $('#exitBtn').isDisplayed()).toBe(false);
    });

    it('should open if a mediastation is defined and is reachable and returns a JSON with a defined controller-ip', async () => {
        await setupFunctionalMediaStationComunication();

        let json: any = createBasicJSON("e2e-test-mediastation-reachable");

        setTemporaryContentJSON(JSON.stringify(json));

        await restartApp();
        await openMediaStation(0, true);

        expect(await $('#exitBtn').isDisplayed()).toBe(true);
    });
});