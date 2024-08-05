import {$} from "@wdio/globals";


export async function createNewTag(name:string):Promise<void> {
    await $('#newTag').click();

    await $("#inputField").isExisting();
    await $("#inputField").click();
    await $("#inputField").setValue(name);

    await $("#saveBtn").click();
}