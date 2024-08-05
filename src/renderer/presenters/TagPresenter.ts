import {ModelMain} from "renderer/models/ModelMain.js";

export interface ITag {
    id: number;
    title: string;
}

export class TagPresenter {
    private _modelMain: ModelMain;

    constructor(modelMain: ModelMain) {
        this._modelMain = modelMain;
    }

    getAllTags(mediaStationId: number): ITag[] {
        let loadedTags: Map<number, string> = this._modelMain.museaClient.tagService.getAllTags(mediaStationId);
        let tags: ITag[] = [];

        loadedTags.forEach((name: string, id: number) => {
            tags.push({id: id, title: name});
        });

        return tags.sort(this._sortItemsByTitleAlphabetically);
    }

    createNewTag(mediaStationId: number, name: string): number {
        return this._modelMain.museaClient.tagService.createTag(mediaStationId, name);
    }

    addTagToContent(mediaStationId: number, contentId: number, tagId: number): void {
        this._modelMain.museaClient.tagService.addTagToContent(mediaStationId, contentId, tagId);
    }

    removeTagFromContent(mediaStationId: number, contentId: number, tagId: number): void {
        this._modelMain.museaClient.tagService.removeTagFromContent(mediaStationId, contentId, tagId);
    }

    deleteTags(mediaStationId: number, tagIds: number[]): void {
        for (let i: number = 0; i < tagIds.length; i++)
            this._modelMain.museaClient.tagService.deleteTag(mediaStationId, tagIds[i]);
    }

    /**
     * returns all tags containing the passed string. Alphabetically sorted.
     *
     * If the string is empty, all tags are returned.
     *
     * @param {number} mediaStationId
     * @param {string} namePart
     * @returns {Map<number, string>}
     */
    findTagsContainingString(mediaStationId: number, namePart: string): ITag[] {
        let allTags: Map<number, string> = this._modelMain.museaClient.tagService.getAllTags(mediaStationId);
        let matchingTags: ITag[] = [];
        let namePartLowercase: string = namePart.toLowerCase();

        allTags.forEach((name: string, id: number) => {
            if (name.toLowerCase().includes(namePartLowercase))
                matchingTags.push({id: id, title: name});
        });

        return matchingTags.sort(this._sortItemsByTitleAlphabetically);
    }

    getAssignedTagIds(mediaStationId: number, contentId: number): number[] {
        return this._modelMain.museaClient.tagService.getTagIdsForContent(mediaStationId, contentId);
    }

    private _sortItemsByTitleAlphabetically(a: any, b: any): number {
        return a.title.localeCompare(b.title);
    }
}