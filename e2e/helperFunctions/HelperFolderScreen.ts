import {$} from "@wdio/globals";

export async function openFolderByItemId(itemIdInList: number): Promise<void> {
    let folderName: string = await $('#item' + itemIdInList.toString() + ' #title').getText();

    console.log("Test / Open folder: ", itemIdInList, folderName);
    await $('#item' + itemIdInList.toString()).click();

    await browser.waitUntil(async () => {
        return await $('#mainTitle').getText() === folderName
    });
}

export async function searchForString(searchStr: string): Promise<void> {
    console.log("Test / Search: ", searchStr);

    await $('#searchField').click();

    if (searchStr !== "")
        await $('#searchField').setValue(searchStr);
}

/**
 * modus 0 = contents, modus 1 = tags
 *
 * @param {number} modus
 * @returns {Promise<void>}
 */
export async function selectModus(modus: number): Promise<void> {
    console.log("Test / Select Modus: ", modus.toString());

    await $('#modus' + modus.toString()).click();
}

export async function clickBackBtn(parentFolderName: string): Promise<void> {
    console.log("Test / Click back, expected parent-folder-name: ", parentFolderName);

    await $('#backBtn').click();

    if (parentFolderName == "")
        await browser.waitUntil(async () => {
            return ! await $('#mainTitle').isExisting()
        });
    else
        await browser.waitUntil(async () => {
            return await $('#mainTitle').getText() === parentFolderName
        });
}

export async function checkListEntry(entryId: number, name: string): Promise<void> {
    let item: string = '#item' + entryId.toString();

    expect(await $(item + ' #title').getText()).toBe(name);
}

export async function openTagAdminForListItemId(itemId: number): Promise<void> {
    let item: string = '#item' + itemId.toString();

    await $(item + ' #openTagAdmin').click();
    await $("#fullScreenTagAdmin").isExisting();
}

export async function closeTagAdmin(): Promise<void> {
    console.log("Test / Close Tag-Admin");

    await $( '#btnClose').click();
    await $('#fullScreenTagAdmin').waitForExist({ reverse: true });
}

export async function openTagInTagModus(itemIdInList: number): Promise<void> {
    console.log("Test / Open Tag: ", itemIdInList.toString());

    let tagName: string = await $('#item' + itemIdInList.toString() + ' #title').getText();

    await $('#item' + itemIdInList.toString()).click();

    await browser.waitUntil(async () => {
        return await $('#mainTitle').getText() === tagName
    });
}