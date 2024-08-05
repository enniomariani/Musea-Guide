import {
    receivedCommandHistory, removeAllSavedFiles, setTemporaryContentJSON, setupFunctionalMediaStationComunication
} from "./helperFunctions/HelperFunctions.js";
import {
    addContentByFolderId, addSubfolderById, addTag, createBasicJSON
} from "./helperFunctions/HelperCreateContentJSON.js";
import {openMediaStation, restartApp} from "./helperFunctions/HelperMediaStationScreen.js";
import {
    clickContent,
    clickFadeOutBtn,
    clickMuteUnmute,
    clickPlayPause,
    waitUntilMediaControlsAreHidden
} from "./helperFunctions/HelperMediaPlayback.js";
import {$, expect} from "@wdio/globals";
import {
    clickBackBtn,
    closeTagAdmin, openFolderByItemId,
    openTagAdminForListItemId,
    searchForString,
    selectModus
} from "./helperFunctions/HelperFolderScreen.js";
import {Key} from "webdriverio";
import {advanceVirtualTime, getCDPSession, setVirtualTime} from "./helperFunctions/HelperSkipTime.js";
import {CDPSession} from "puppeteer-core";
process.env.TEST = 'true';

/**
 *
 * GENERAL INFORMATION ABOUT THE TEST-STRUCTURE:
 *
 * - the state of the app remains changed between the tests, except if the describe-text states "New Scenario"
 * - if multiple tests in the same scenario fail: take a look at the first one, it could impact the others!
 */

console.log("TEST-START");

before("create test-setup", async () => {
    removeAllSavedFiles();

    await setupFunctionalMediaStationComunication();

    const json: any = createBasicJSON("e2e-test-mediastation-reachable");
    const idOfFolder1: number = addSubfolderById(json, 0, "e2e-test-folder-1");

    addContentByFolderId(json, 0, "e2e-test-content-A", "image");
    addContentByFolderId(json, 0, "e2e-test-content-B", "video");

    addContentByFolderId(json, idOfFolder1, "e2e-test-content-X-in-subfolder-1");

    addTag(json, "e2e-Tag-1");

    console.log("final generated test-json: ", JSON.stringify(json));

    setTemporaryContentJSON(JSON.stringify(json));

    await restartApp();
});

after("removeSavedMediaStations", () => {
    removeAllSavedFiles();
});

describe("Activate/deactivate different contents", () => {
    it('clicking on an image-content should send play and light-commands to media-apps', async () => {
        await openMediaStation(0, true);
        await clickContent(0);

        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'play', '10']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '0' ]);
    });

    it('clicking on fade-out should send a stop-call and a light-command to the media-apps', async () => {
        await clickFadeOutBtn();

        console.log("complete history: ", receivedCommandHistory.toString())

        //default light-preset is 2 at the moment: see Musea-Client for this
        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'stop']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '2' ]);
    });

    it('clicking on an video-content should send play and light-commands to media-apps', async () => {
        await clickContent(1);

        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'play', '10']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '0' ]);
    });

    it('clicking on fade-out should send a stop-call and a light-command to the media-apps', async () => {
        await clickFadeOutBtn();

        //default light-preset is 2 at the moment: see Musea-Client for this
        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'stop']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '2' ]);
    });
});

describe("Activate video-content", () => {
    it('activated video-content should show play/volume-buttons', async () => {
        await clickContent(1);

        expect(await $('#PlayPauseBtn').isExisting()).toBe(true);
        expect(await $('#muteUnmuteBtn').isExisting()).toBe(true);
    });

    it('clicking mute/unmute should send the correct commands', async () => {
        await clickMuteUnmute();
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual(['system', 'volume', 'mute']);

        await clickMuteUnmute();
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual(['system', 'volume', 'unmute']);
    });

    it('clicking pause/play should send the correct commands', async () => {
        await clickPlayPause();
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual(['media', 'control', 'pause']);

        await clickPlayPause();
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual(['media', 'control', 'play']);
    });

    it('when the video ended after 30 seconds, 3 sync-messages and a stop/light-message should have been sent', async () => {
        await clickFadeOutBtn();

        const start = new Date(2021, 3, 14).getTime(); // 2021-04-14 local
        const cdpSession:CDPSession = await getCDPSession();
        await setVirtualTime(start, cdpSession);

        // Sanity check
        const t0 = await browser.execute(() => Date.now());

        await clickContent(1);

        await advanceVirtualTime(10010, cdpSession);
        await browser.pause(100);

        await advanceVirtualTime(10010, cdpSession);
        await browser.pause(100);

        await advanceVirtualTime(10010, cdpSession);
        await browser.pause(100);

        await advanceVirtualTime(12010, cdpSession);
        await browser.pause(100);

        console.log("receivedCommandHistory: ", receivedCommandHistory);

        expect(receivedCommandHistory[receivedCommandHistory.length - 5]).toEqual(['media', 'control', 'sync', '10000']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 4]).toEqual(['media', 'control', 'sync', '20000']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 3]).toEqual(['media', 'control', 'sync', '30000']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'stop']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '2' ]);

        expect(await $('#PlayPauseBtn').isExisting()).toBe(true);
    });
});

describe("Navigating inside the app should stop the content", () => {
    it('Searching for a content should send stop and hide content', async () => {
        await clickContent(1);
        await searchForString("alpha");
        await waitUntilMediaControlsAreHidden();

        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'stop']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '2' ]);

        //go to start-state again
        await browser.keys(Key.Escape);
    });

    it('Opening Tag-admin should send stop and hide content', async () => {
        await clickContent(1);
        await openTagAdminForListItemId(0);
        await waitUntilMediaControlsAreHidden();

        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'stop']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '2' ]);

        //go to start-state again
        await closeTagAdmin();
    });

    it('Opening a folder should send stop and hide content', async () => {
        await clickContent(1);
        await openFolderByItemId(2);
        await waitUntilMediaControlsAreHidden();

        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'stop']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '2' ]);

        //go to start-state again
        await clickBackBtn("");
    });

    it('Switching to playlist/tag-modus should send stop and hide content', async () => {
        await clickContent(1);
        await selectModus(1);
        await waitUntilMediaControlsAreHidden();

        expect(receivedCommandHistory[receivedCommandHistory.length - 2]).toEqual(['media', 'control', 'stop']);
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual([ 'light', 'preset', '2' ]);

        //go to start-state again
        await selectModus(0);
    });
});