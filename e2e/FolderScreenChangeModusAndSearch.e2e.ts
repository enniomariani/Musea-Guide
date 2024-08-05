import {after} from "mocha";
import {removeAllSavedFiles, setTemporaryContentJSON, setupFunctionalMediaStationComunication
} from "./helperFunctions/HelperFunctions.js";
import {
    openMediaStation, restartApp
} from "./helperFunctions/HelperMediaStationScreen.js";
import {
    checkListEntry, openFolderByItemId, searchForString, selectModus
} from "./helperFunctions/HelperFolderScreen.js";
import {
    addContentByFolderId, addSubfolderById, addTag, createBasicJSON
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

describe("Switch between the different screen-modi contents/tags. It ", () => {
    before(async () => {
            await setupFunctionalMediaStationComunication();

            let json: any = createBasicJSON("e2e-test-mediastation-reachable");

            const idOfFolder1: number = addSubfolderById(json, 0, "e2e-test-folder-1");
            addSubfolderById(json, 0, "e2e-test-folder-B");
            addSubfolderById(json, 0, "e2e-test-folder-Z");
            addSubfolderById(json, 0, "e2e-test-folder-C");

            addContentByFolderId(json, 0, "e2e-test-content-C");
            addContentByFolderId(json, 0, "e2e-test-content-B");
            addContentByFolderId(json, 0, "e2e-test-content-A");
            addContentByFolderId(json, idOfFolder1, "e2e-test-content-X-in-subfolder-1");

            addSubfolderById(json, idOfFolder1, "subfolder-2-of-folder1");
            addSubfolderById(json, idOfFolder1, "subfolder-1-of-folder1");
            addSubfolderById(json, idOfFolder1, "subfolder-3-of-folder1");

            addTag(json, "e2e-Tag-7");
            addTag(json, "e2e-Tag-1");
            addTag(json, "e2e-Tag-3");
            addTag(json, "e2e-Tag-8");
            addTag(json, "e2e-Tag-2");

            console.log("final generated test-json: ", JSON.stringify(json));

            setTemporaryContentJSON(JSON.stringify(json));

            await restartApp();
        }
    );

    async function checkAllEntriesInRootFolderView():Promise<void>{
        //-> the folders should be arranged alphabetically
        await checkListEntry(0, "e2e-test-content-A");
        await checkListEntry(1, "e2e-test-content-B");
        await checkListEntry(2, "e2e-test-content-C");

        await checkListEntry(3, "e2e-test-folder-1");
        await checkListEntry(4, "e2e-test-folder-B");
        await checkListEntry(5, "e2e-test-folder-C");
        await checkListEntry(6, "e2e-test-folder-Z");

        expect(await $('#backBtn').isExisting()).toBe(false);
        expect(await $('#mainTitle').isExisting()).toBe(false);
    }

    async function checkAllEntriesInRootTagView():Promise<void>{
        //-> the tags should be arranged alphabetically
        await checkListEntry(0, "e2e-Tag-1");
        await checkListEntry(1, "e2e-Tag-2");
        await checkListEntry(2, "e2e-Tag-3");
        await checkListEntry(3, "e2e-Tag-7");
        await checkListEntry(4, "e2e-Tag-8");

        expect(await $('#mainTitle').isExisting()).toBe(false);
        expect(await $('#backBtn').isExisting()).toBe(false);
    }

    it('should show all top-level folders and contents from the default-test-content-json + title should be empty', async () => {
        await openMediaStation(0, true);
        await checkAllEntriesInRootFolderView();
    });

    it('should show the sub-folders and contents of folder 1 + title should be the one from the selected folder', async () => {
        await openFolderByItemId(3);

        //-> the folders should be arranged alphabetically
        await checkListEntry(0, "e2e-test-content-X-in-subfolder-1");
        await checkListEntry(1, "subfolder-1-of-folder1");
        await checkListEntry(2, "subfolder-2-of-folder1");
        await checkListEntry(3, "subfolder-3-of-folder1");

        expect(await $('#mainTitle').getText()).toBe("e2e-test-folder-1");
    });

    it('switching to modus TAGS should show all tags + title empty', async () => {
        await selectModus(1);
        await checkAllEntriesInRootTagView();
    });

    it('switching to modus CONTENTS should show all subfolders and contents from main-folder', async () => {
        await selectModus(0);
        await checkAllEntriesInRootFolderView();
    });

    it('clicking inside the search-window should display all contents, alphabetically sorted', async () => {
        await searchForString("");

        //-> the folders should be arranged alphabetically
        await checkListEntry(0, "e2e-test-content-A");
        await checkListEntry(1, "e2e-test-content-B");
        await checkListEntry(2, "e2e-test-content-C");
        await checkListEntry(3, "e2e-test-content-X-in-subfolder-1");
    });

    it('entering a search-string should only display the matching contents', async () => {
        await searchForString("X");

        //-> the folders should be arranged alphabetically
        await checkListEntry(0, "e2e-test-content-X-in-subfolder-1");
    });

    it('switching from the content-search to the tags-modus should show all tags (quit search)', async () => {
        await selectModus(1);
        await checkAllEntriesInRootTagView();
    });

    it('searching for tags should show only those tags', async () => {
        await searchForString("3");
        await checkListEntry(0, "e2e-Tag-3");
    });

    it('selecting the searched tag should open it and show its title', async () => {
        await $('#item0').click();
        await $('#backBtn').waitForDisplayed({ timeout: 5000});

        expect(await $('#mainTitle').getText()).toBe("e2e-Tag-3");
        expect(await $('#backBtn').isExisting()).toBe(true);
    });

    it('clicking back and then to the contents-modus should list all contents and subfolders', async () => {
        await $('#backBtn').click();
        await selectModus(0);
        await checkAllEntriesInRootFolderView();
    });
});