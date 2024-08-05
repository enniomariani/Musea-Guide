import {$} from "@wdio/globals";

export async function clickContent(itemIdInList: number): Promise<void> {
    let contentName: string = await $('#item' + itemIdInList.toString() + ' #title').getText();

    console.log("open folder: ", itemIdInList, contentName)
    await $('#item' + itemIdInList.toString()).click();

    await browser.waitUntil(async () => {
        return await $('#fadeOutBtn').isDisplayed()
    });
}

export async function clickFadeOutBtn(): Promise<void> {
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
    await $('#muteUnmuteBtn').click();
}

export async function clickPlayPause(): Promise<void> {
    await $('#PlayPauseBtn').click();
}