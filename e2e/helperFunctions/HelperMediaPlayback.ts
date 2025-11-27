import {$} from "@wdio/globals";

export async function clickContent(itemIdInList: number): Promise<void> {
    let contentName: string = await $('#item' + itemIdInList.toString() + ' #title').getText();

    console.log("Test / Open folder: ", itemIdInList, contentName)
    await $('#item' + itemIdInList.toString()).click();

    await browser.waitUntil(async () => {
        return await $('#fadeOutBtn').isDisplayed()
    });
}

export async function clickFadeOutBtn(): Promise<void> {
    console.log("Test / Click fade out");

    await $('#fadeOutBtn').click();
}

export async function waitUntilMediaControlsAreHidden(): Promise<void> {
    if(!(await $('#fadeOutBtn').isDisplayed())){
        return;
    }

    await browser.waitUntil(async () => {
        return !(await $('#fadeOutBtn').isDisplayed());
    });
}

export async function clickMuteUnmute(): Promise<void> {
    console.log("Test / Click mute/unmute");

    await $('#muteUnmuteBtn').click();
}

export async function clickPlayPause(): Promise<void> {
    console.log("Test / Click play/pause");

    await $('#PlayPauseBtn').click();
}