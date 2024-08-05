import {after} from "mocha";
import {removeAllSavedFiles, setTemporaryContentJSON, setupFunctionalMediaStationComunication
} from "./helperFunctions/HelperFunctions.js";
import {
    openMediaStation, restartApp
} from "./helperFunctions/HelperMediaStationScreen.js";
import {
    checkListEntry, clickBackBtn,
    openTagAdminForListItemId, openTagInTagModus, selectModus
} from "./helperFunctions/HelperFolderScreen.js";
import {
    addContentByFolderId, addTag, createBasicJSON
} from "./helperFunctions/HelperCreateContentJSON.js";
import {$} from "@wdio/globals";

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

describe("Scenario: Create and delete tags: ", () => {
    before(async () => {
            await setupFunctionalMediaStationComunication();

            let json: any = createBasicJSON("e2e-test-mediastation-reachable");

            addContentByFolderId(json, 0, "e2e-test-content-A");
            addContentByFolderId(json, 0, "e2e-test-content-B");
            addContentByFolderId(json, 0, "e2e-test-content-C");
            addContentByFolderId(json, 0, "e2e-test-content-D");

            addTag(json, "e2e-Tag-1");
            addTag(json, "e2e-Tag-2");
            addTag(json, "e2e-Tag-3");
            addTag(json, "e2e-Tag-7");
            addTag(json, "e2e-Tag-8");

            console.log("final generated test-json: ", JSON.stringify(json));

            setTemporaryContentJSON(JSON.stringify(json));
            await restartApp();
        }
    );

    it('activating two tags for content 0 should mark them as selected in the list, all others not selected', async () => {
        await openMediaStation(0, true);
        await openTagAdminForListItemId(0);
        await $("#tag0 #checkbox-false").click();
        await $("#tag2 #checkbox-false").click();

        await browser.pause(1000);

        expect(await $("#tag0 #checkbox-true").isExisting()).toBe(true);
        expect(await $("#tag1 #checkbox-true").isExisting()).toBe(false);
        expect(await $("#tag2 #checkbox-true").isExisting()).toBe(true);
        expect(await $("#tag3 #checkbox-true").isExisting()).toBe(false);
        expect(await $("#tag4 #checkbox-true").isExisting()).toBe(false);
        expect(await $("#tag5 #checkbox-true").isExisting()).toBe(false);
    });

    it('activating three other tags for content 1 should mark them as selected in the list, all others not selected', async () => {
        await $("#btnClose").click();
        await openTagAdminForListItemId(2);
        await $("#tag1 #checkbox-false").click();
        await $("#tag2 #checkbox-false").click();
        await $("#tag3 #checkbox-false").click();

        await browser.pause(1000);

        expect(await $("#tag0 #checkbox-true").isExisting()).toBe(false);
        expect(await $("#tag1 #checkbox-true").isExisting()).toBe(true);
        expect(await $("#tag2 #checkbox-true").isExisting()).toBe(true);
        expect(await $("#tag3 #checkbox-true").isExisting()).toBe(true);
        expect(await $("#tag4 #checkbox-true").isExisting()).toBe(false);
        expect(await $("#tag5 #checkbox-true").isExisting()).toBe(false);
    });

    it('switching to the tags-modus, the selected tag 0 should show the assigned content', async () => {
        await $("#btnClose").click();
        await selectModus(1);

        await openTagInTagModus(0);

        await checkListEntry(0, "e2e-test-content-A");
        expect(await $("item1").isExisting()).toBe(false);
    });

    it('... the selected tag 1 should show the assigned content', async () => {
        await clickBackBtn("");

        await openTagInTagModus(1);

        await checkListEntry(0, "e2e-test-content-C");
        expect(await $("item1").isExisting()).toBe(false);
    });

    it('... the selected tag 2 should show the assigned contents', async () => {
        await clickBackBtn("");

        await openTagInTagModus(2);

        await checkListEntry(0, "e2e-test-content-A");
        await checkListEntry(1, "e2e-test-content-C");
        expect(await $("item2").isExisting()).toBe(false);
    });

    it('after restarting the app, the assigned contents to the tags should be the same as before', async () => {
        await restartApp();
        await openMediaStation(0, true);
        await selectModus(1);

        //CHECK FIRST TAG
        await openTagInTagModus(0);

        await checkListEntry(0, "e2e-test-content-A");
        expect(await $("item1").isExisting()).toBe(false);

        await clickBackBtn("");

        //CHECK SECOND TAG
        await openTagInTagModus(1);

        await checkListEntry(0, "e2e-test-content-C");
        expect(await $("item1").isExisting()).toBe(false);

        //CHECK THIRD TAG
        await clickBackBtn("");

        //select tag 0
        await openTagInTagModus(2);

        await checkListEntry(0, "e2e-test-content-A");
        await checkListEntry(1, "e2e-test-content-C");
        expect(await $("item2").isExisting()).toBe(false);
    });
});