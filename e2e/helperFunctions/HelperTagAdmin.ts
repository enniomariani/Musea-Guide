import {$} from "@wdio/globals";


export async function createNewTag(name:string):Promise<void> {
    console.log("Test / Create new Tag: ", name);

    await $('#newTag').click();

    await $("#inputField").isExisting();
    await $("#inputField").click();
    await $("#inputField").setValue(name);

    await $("#saveBtn").click();
}