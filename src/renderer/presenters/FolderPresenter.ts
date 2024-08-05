import {IMediaPlayerData, MediaType} from "musea-client/renderer";
import {ModelMain} from "renderer/models/ModelMain.js";

export interface IContentMediaInfo{
    id:number;
    mediaPlayerName:string;
    savedMedia:string | null;
}

export interface ICompleteContentInfo{
    id:number;
    title:string;
    media:IContentMediaInfo[];
    tags:number[];
}

export interface IFolderInfo{
    id:number;
    title:string;
}

export class FolderPresenter {
    private _modelMain: ModelMain;

    constructor(modelMain: ModelMain) {
        this._modelMain = modelMain;
    }

    getNameOfFolder(mediaStationId:number, folderId:number):string{
        return this._modelMain.museaClient.folderService.getName(mediaStationId, folderId);
    }

    getIdOfParentFolder(mediaStationId:number, folderId:number):number{
        return this._modelMain.museaClient.folderService.getIdOfParentFolder(mediaStationId, folderId);
    }

    getAllContentsInFolder(mediaStationId: number, folderId: number):ICompleteContentInfo[] {
        let allContents:Map<number, string> = this._modelMain.museaClient.folderService.getAllContentsInFolder(mediaStationId, folderId);

        return this._createMapForFoundContents(mediaStationId, allContents).sort(this._sortItemsByTitleAlphabetically);
    }

    getAllSubFoldersInFolder(mediaStationId: number, parentFolderId: number):IFolderInfo[] {
        const allSubFolder:Map<number, string> =  this._modelMain.museaClient.folderService.getAllSubFoldersInFolder(mediaStationId, parentFolderId);
        return this._createMapForFoundSubFolders(allSubFolder).sort(this._sortItemsByTitleAlphabetically);
    }

    findContentsContainingTag(mediaStationId:number,tagId:number):ICompleteContentInfo[]{
        let allContents:Map<number, string> = this._modelMain.museaClient.tagService.findContentsByTag(mediaStationId, tagId);

        return this._createMapForFoundContents(mediaStationId, allContents);
    }

    findContentsContainingString(mediaStationId:number, folderId:number, namePart:string):ICompleteContentInfo[]{
        let allContents:Map<number, string> = this._modelMain.museaClient.folderService.findContentsByNamePart(mediaStationId, folderId, namePart);

        return this._createMapForFoundContents(mediaStationId, allContents).sort(this._sortItemsByTitleAlphabetically);
    }

    private _convertMediaTypeForView(type:string | null):string | null{
        switch(type){
            case    MediaType.IMAGE:
                return "image";
            case MediaType.VIDEO:
                return "video";
            default:
                return null;
        }
    }

    private _createMapForFoundContents(mediaStationId:number, foundContents:Map<number, string>):ICompleteContentInfo[]{
        let contents:ICompleteContentInfo[] = [];
        let allMediaPlayers: Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);

        foundContents.forEach((name:string, contentId:number)=>{
            const allMedia:IContentMediaInfo[] = [];

            allMediaPlayers.forEach((data:IMediaPlayerData, mediaPlayerId:number)=>{
                allMedia.push({id: mediaPlayerId, mediaPlayerName: data.name,
                    savedMedia: this._convertMediaTypeForView(this._modelMain.museaClient.mediaService.getMediaType(mediaStationId,contentId, mediaPlayerId))});
            });

            contents.push({id:contentId, title: name, media: allMedia, tags: this._modelMain.museaClient.tagService.getTagIdsForContent(mediaStationId, contentId)});
        });

        return contents;
    }

    private _createMapForFoundSubFolders(foundSubFolders:Map<number, string>):IFolderInfo[]{
        let folders:IFolderInfo[] = [];

        foundSubFolders.forEach((name:string, id:number)=>{
            folders.push({id:id, title: name});
        });

        return folders;
    }

    private _sortItemsByTitleAlphabetically(a: any, b: any): number {
        return a.title.localeCompare(b.title);
    }
}