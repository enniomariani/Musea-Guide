import {after} from "mocha";
import {removeAllSavedFiles, setTemporaryContentJSON, setupFunctionalMediaStationComunication
} from "./helperFunctions/HelperFunctions.js";
import {
    exitMediaStation,
    openMediaStation, restartApp
} from "./helperFunctions/HelperMediaStationScreen.js";
import {
    checkListEntry, closeTagAdmin,
    openTagAdminForListItemId, selectModus
} from "./helperFunctions/HelperFolderScreen.js";
import {
    addContentByFolderId, addTag, createBasicJSON
} from "./helperFunctions/HelperCreateContentJSON.js";
import {createNewTag} from "./helperFunctions/HelperTagAdmin.js";

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

    it('creating two new Tags - they should be displayed in the list', async () => {
        await openMediaStation(0, true);
        await openTagAdminForListItemId(0);
        await createNewTag("A) e2e-NEW-Tag 1");
        await createNewTag("B) e2e-NEW-Tag 2");

        expect(await $("#tag0 #text").getText()).toBe("A) e2e-NEW-Tag 1");
        expect(await $("#tag1 #text").getText()).toBe("B) e2e-NEW-Tag 2");
        expect(await $("#tag2 #text").getText()).toBe("e2e-Tag-1");
        expect(await $("#tag3 #text").getText()).toBe("e2e-Tag-2");
        expect(await $("#tag4 #text").getText()).toBe("e2e-Tag-3");
        expect(await $("#tag5 #text").getText()).toBe("e2e-Tag-7");
        expect(await $("#tag6 #text").getText()).toBe("e2e-Tag-8");
    });

    it('... the created tags should be marked as selected', async () => {
        expect(await $("#tag0 #checkbox-true").isExisting()).toBe(true);
        expect(await $("#tag1 #checkbox-true").isExisting()).toBe(true);
    });

    it('deleting the first two tags should remove them from the list', async () => {
        const origin = await $('#tag0 #text');

        //simulate long click on tag to select tags for deletion:
        await browser.action('pointer')
            .move({ duration: 0, origin, x: 0, y: 0 })
            .down({ button: 0 }) // left button
            .pause(1100)    //long click is 1000 MS, to be sure it works a bit more
            .up({ button: 0 })
            .perform();

        //select second tag to delete
        await $("#tag1").click();
        await $("#btnDelete").isExisting();
        await $("#btnDelete").click();
        await $("#btnYes").isExisting();
        await $("#btnYes").click();

        expect(await $("#tag0 #text").getText()).toBe("e2e-Tag-1");
        expect(await $("#tag1 #text").getText()).toBe("e2e-Tag-2");
        expect(await $("#tag2 #text").getText()).toBe("e2e-Tag-3");
        expect(await $("#tag3 #text").getText()).toBe("e2e-Tag-7");
        expect(await $("#tag4 #text").getText()).toBe("e2e-Tag-8");
    });

    it('after restarting the app, the tags should be the same ones as before, including the new ones and without the deleted', async () => {
        await closeTagAdmin();//is necessary, because the sync-call is fired when the tag-admin window is left
        await exitMediaStation();
        await restartApp();
        await openMediaStation(0, true);
        await openTagAdminForListItemId(0);

        expect(await $("#tag0 #text").getText()).toBe("e2e-Tag-1");
        expect(await $("#tag1 #text").getText()).toBe("e2e-Tag-2");
        expect(await $("#tag2 #text").getText()).toBe("e2e-Tag-3");
        expect(await $("#tag3 #text").getText()).toBe("e2e-Tag-7");
        expect(await $("#tag4 #text").getText()).toBe("e2e-Tag-8");
    });

    it('the tags should also be visible in the list when activating the tag-modus', async () => {
        await $("#btnClose").click();
        await selectModus(1);

        await checkListEntry(0,"e2e-Tag-1");
        await checkListEntry(1,"e2e-Tag-2");
        await checkListEntry(2,"e2e-Tag-3");
        await checkListEntry(3,"e2e-Tag-7");
        await checkListEntry(4,"e2e-Tag-8");
    });
});