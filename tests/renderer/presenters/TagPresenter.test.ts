import {beforeEach, describe, expect, it} from "@jest/globals";
import {ITag, TagPresenter} from "renderer/presenters/TagPresenter.js";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";

let presenter: TagPresenter;
let mockModelMain: MockModelMain;

beforeEach(() => {
    mockModelMain = new MockModelMain();
    presenter = new TagPresenter(mockModelMain);
});

describe("getAllTags() ", () => {
    const mediaStationId: number = 1;

    it("should return the tags it got from the museaClient, alphabetically sorted", () => {
        let answerMap: Map<number, string> = new Map();
        let receivedMap: ITag[];
        answerMap.set(0, "tag1");
        answerMap.set(100, "tag3");
        answerMap.set(3, "tag2");
        mockModelMain.museaClient.tagService.getAllTags.mockReturnValueOnce(answerMap);

        receivedMap = presenter.getAllTags(mediaStationId);

        expect(receivedMap[0]).toStrictEqual({id:0, title:"tag1"});
        expect(receivedMap[1]).toStrictEqual({id:3, title:"tag2"});
        expect(receivedMap[2]).toStrictEqual({id:100, title:"tag3"});
    });
});

describe("createNewTag() ", () => {
    const mediaStationId: number = 1;

    it("should call createNewTag from the museaClient", () => {
        presenter.createNewTag(mediaStationId, "newTag");

        expect(mockModelMain.museaClient.tagService.createTag).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.tagService.createTag).toHaveBeenCalledWith(mediaStationId, "newTag");
    });
});

describe("addTagToContent() ", () => {
    const mediaStationId: number = 1;

    it("should call addTagToContent from the museaClient", () => {
        presenter.addTagToContent(mediaStationId, 2, 3);

        expect(mockModelMain.museaClient.tagService.addTagToContent).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.tagService.addTagToContent).toHaveBeenCalledWith(mediaStationId, 2, 3);
    });
});

describe("removeTagFromContent() ", () => {
    const mediaStationId: number = 1;

    it("should call removeTagFromContent from the museaClient", () => {
        presenter.removeTagFromContent(mediaStationId, 20, 13);

        expect(mockModelMain.museaClient.tagService.removeTagFromContent).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.tagService.removeTagFromContent).toHaveBeenCalledWith(mediaStationId, 20, 13);
    });
});

describe("deleteTags() ", () => {
    const mediaStationId: number = 1;

    it("should call deleteTags from the museaClient", () => {
        presenter.deleteTags(mediaStationId, [20, 12, 0, 13]);

        expect(mockModelMain.museaClient.tagService.deleteTag).toHaveBeenCalledTimes(4);
        expect(mockModelMain.museaClient.tagService.deleteTag).toHaveBeenNthCalledWith(1, mediaStationId, 20);
        expect(mockModelMain.museaClient.tagService.deleteTag).toHaveBeenNthCalledWith(2, mediaStationId, 12);
        expect(mockModelMain.museaClient.tagService.deleteTag).toHaveBeenNthCalledWith(3, mediaStationId, 0);
        expect(mockModelMain.museaClient.tagService.deleteTag).toHaveBeenNthCalledWith(4, mediaStationId, 13);
    });
});

describe("findTagsContainingString() ", () => {
    const allTags:Map<number, string> = new Map();

    allTags.set(0, "tag");
    allTags.set(1, "tag1");
    allTags.set(2, "ta");
    allTags.set(3, "Ta");
    allTags.set(4, "auch ein TAG");

    it("should return a correctly formated map with data from museaClient.getAllTags", () => {
        mockModelMain.museaClient.tagService.getAllTags.mockReturnValue(allTags);

        let receivedData:ITag[] = presenter.findTagsContainingString(2,  "tag");

        expect(receivedData.length).toEqual(3);
        expect(receivedData[0]).toEqual({id:4, title:"auch ein TAG"});
        expect(receivedData[1]).toEqual({id:0, title:"tag"});
        expect(receivedData[2]).toEqual({id:1, title:"tag1"});
    });

    it("should return a correctly formated map with data from museaClient.getAllTags (search should be case-insensitive)", () => {
        mockModelMain.museaClient.tagService.getAllTags.mockReturnValue(allTags);

        let receivedData:ITag[] = presenter.findTagsContainingString(2,  "tAg");

        expect(receivedData.length).toEqual(3);
        expect(receivedData[0]).toEqual({id:4, title:"auch ein TAG"});
        expect(receivedData[1]).toEqual({id:0, title:"tag"});
        expect(receivedData[2]).toEqual({id:1, title:"tag1"});
    });

    it("should return all tags if passed string is empty", () => {
        mockModelMain.museaClient.tagService.getAllTags.mockReturnValue(allTags);

        let receivedData:ITag[] = presenter.findTagsContainingString(2,  "");

        expect(receivedData.length).toEqual(5);
        expect(receivedData[0]).toEqual({id:4, title:"auch ein TAG"});
        expect(receivedData[1]).toEqual({id:2, title:"ta"});
        expect(receivedData[2]).toEqual({id:3, title:"Ta"});
        expect(receivedData[3]).toEqual({id:0, title:"tag"});
        expect(receivedData[4]).toEqual({id:1, title:"tag1"});
    });
});

describe("getAssignedTagIds() ", () => {
    const mediaStationId: number = 1;

    it("return all ids of the tags assigned to the passed content-id", () => {
        const tagIds:number[] = [0, 20, 200, 3];
        let returnValues:number[];
        mockModelMain.museaClient.tagService.getTagIdsForContent.mockImplementation((msId:number, contentId:number) =>{
            if(msId === mediaStationId && contentId === 20)
                return tagIds;
            else
                return null;
        });

        returnValues = presenter.getAssignedTagIds(mediaStationId, 20);

        expect(returnValues).toStrictEqual(tagIds);
    });
});