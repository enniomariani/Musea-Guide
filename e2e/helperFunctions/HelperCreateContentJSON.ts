/**
 *
 * @param {string} mediaStationName
 * @param {string} controllerIp
 * @returns {any}    returns a JSON-object which is in a valid contents.json-format
 */
export function createBasicJSON(mediaStationName:string, controllerIp:string = "127.0.0.1"):any{
    return {
        "name": mediaStationName,
        "folderIdCounter": 1,
        "contentIdCounter": 1,
        "mediaPlayerIdCounter": 1,
        "tagIdCounter": 1,
        "mediaPlayers": [
            {
                "id": 0,
                "name": "test-controller-reachable",
                "ip": controllerIp,
                "role": "roleController"
            }
        ],
        "tags": [],
        "rootFolder": {
            "id": 0,
            "name": "root",
            "contents": [],
            "subFolders": []
        }
    }
}

export function addSubfolderById(jsonData: any, parentId: number, subfolderName: string): number {
    function recurse(folder:any): number | null {
        if (folder.id === parentId) {
            const newId = jsonData.folderIdCounter++;
            const newSubfolder = {
                id: newId,
                name: subfolderName,
                contents: [],
                subFolders: []
            };
            folder.subFolders.push(newSubfolder);
            return newId;
        }

        for (let sub of folder.subFolders) {
            const result = recurse(sub);
            if (result !== null) return result;
        }

        return null;
    }

    const result = recurse(jsonData.rootFolder);

    if (result === null) {
        console.warn(`Folder with id ${parentId} not found.`);
        return -1;
    }

    return result;
}

export function addContentByFolderId(jsonData: any, folderId: number, contentName: string, mediaType:string | null = null): number {
    function recurse(folder:any): number | null {
        if (folder.id === folderId) {
            const newId = jsonData.contentIdCounter++;
            let newContent = {
                id: newId,
                name: contentName,
                lightIntensity: 0,
                tagIds: [],
                media: []
            };

            if(mediaType !== null){
                newContent.media.push({
                    mediaPlayerId: 0,
                    type: mediaType,
                    idOnMediaPlayer: 10,
                    duration: 30.526667,
                    fileName: "0.mp4"
                })
            }

            folder.contents.push(newContent);
            return newId;
        }

        for (let sub of folder.subFolders) {
            const result = recurse(sub);
            if (result !== null) return result;
        }

        return null;
    }

    const result = recurse(jsonData.rootFolder);
    if (result === null) {
        console.warn(`Folder with id ${folderId} not found.`);
        return -1;
    }

    return result;
}

export function addTag(jsonData: any, tagName: string): number {
    const newId:number = jsonData.tagIdCounter;
    const newTag = {
        id: newId,
        name: tagName
    };
    jsonData.tags.push(newTag);

    jsonData.tagIdCounter++

    return newId;
}