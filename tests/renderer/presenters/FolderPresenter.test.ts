import {beforeEach, describe, expect, it} from "@jest/globals";
import {
    FolderPresenter,
    ICompleteContentInfo,
    IContentMediaInfo
} from "renderer/presenters/FolderPresenter";
import {IMediaPlayerData, MediaType} from "musea-client/renderer";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";

let presenter: FolderPresenter;
let mockModelMain: MockModelMain;

beforeEach(() => {
    mockModelMain = new MockModelMain();
    presenter = new FolderPresenter(mockModelMain);
});

// Utility functions to create mock data
const createMediaPlayerData = (ip: string, name: string, isController: boolean): IMediaPlayerData => ({
    ip,
    name,
    isController,
});

const createCompleteContentInfo = (id:number, name: string, mediaInfo: IContentMediaInfo[], tags:number[]): ICompleteContentInfo => ({
    id: id,
    title: name,
    media: mediaInfo,
    tags:tags
});

const setupMockData = () => {
    const mediaPlayerData1 = createMediaPlayerData("0.0.0.1", "test", true);
    const mediaPlayerData2 = createMediaPlayerData("0.0.0.2", "test2", false);

    const completeContentInfo1 = createCompleteContentInfo(0, "content1", [
        { id: 0, mediaPlayerName: mediaPlayerData1.name, savedMedia: "image" },
        { id: 1, mediaPlayerName: mediaPlayerData2.name, savedMedia: null },
    ], [12, 3]);

    const completeContentInfo2 = createCompleteContentInfo(1, "content2", [
        { id: 0, mediaPlayerName: mediaPlayerData1.name, savedMedia: "video" },
        { id: 1, mediaPlayerName: mediaPlayerData2.name, savedMedia: "image" },
    ], []);

    const expectedResult:ICompleteContentInfo[] = [
        completeContentInfo1,
        completeContentInfo2,
    ];

    const allMediaPlayers = new Map<number, IMediaPlayerData>([
        [0, mediaPlayerData1],
        [1, mediaPlayerData2],
    ]);

    const allContents = new Map<number, string>([
        [0, "content1"],
        [1, "content2"],
    ]);

    return { allMediaPlayers, allContents, expectedResult, completeContentInfo1, completeContentInfo2 };
};

describe("getAllContentsInFolder() ", () => {

    it("should return a correctly formated map with data from mediaPlayerService.getAllMediaPlayers and folderService.getAllContentsInFolder", () => {
        const { allMediaPlayers, allContents, expectedResult, completeContentInfo1, completeContentInfo2 } = setupMockData();

        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockReturnValue(allMediaPlayers);
        mockModelMain.museaClient.folderService.getAllContentsInFolder.mockReturnValue(allContents);
        mockModelMain.museaClient.tagService.getTagIdsForContent.mockImplementation((mediaStationId:number, contentId:number) =>{
            if(contentId === 0)
                return [12, 3];
            else if(contentId === 1)
                return [];
        });

        mockModelMain.museaClient.mediaService.getMediaType.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return MediaType.IMAGE;
                else if(mediaPlayerId === 1)
                    return null;
            }else if(contentId === 1){
                if(mediaPlayerId === 0)
                    return MediaType.VIDEO;
                else if(mediaPlayerId === 1)
                    return MediaType.IMAGE;
            }
        });

        let receivedData = presenter.getAllContentsInFolder(2, 0);

        expect(receivedData).toStrictEqual(expectedResult);
    });
});

describe("findContentsContainingString() ", () => {
    it("should return a correctly formated map with data from mediaPlayerService.getAllMediaPlayers and folderService.findContentsByNamePart", () => {
        const { allMediaPlayers, allContents, expectedResult, completeContentInfo1, completeContentInfo2 } = setupMockData();

        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockReturnValue(allMediaPlayers);
        mockModelMain.museaClient.folderService.findContentsByNamePart.mockReturnValue(allContents);
        mockModelMain.museaClient.tagService.getTagIdsForContent.mockImplementation((mediaStationId:number, contentId:number) =>{
            if(contentId === 0)
                return [12, 3];
            else if(contentId === 1)
                return [];
        });

        mockModelMain.museaClient.mediaService.getMediaType.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return MediaType.IMAGE;
                else if(mediaPlayerId === 1)
                    return null;
            }else if(contentId === 1){
                if(mediaPlayerId === 0)
                    return MediaType.VIDEO;
                else if(mediaPlayerId === 1)
                    return MediaType.IMAGE;
            }
        });

        let receivedData = presenter.findContentsContainingString(2, 0, "searchString");

        expect(receivedData).toStrictEqual(expectedResult);
    });
});

describe("findContentsContainingTag() ", () => {
    it("should return a correctly formated map with data from mediaPlayerService.getAllMediaPlayers and folderService.findContentsByTag", () => {
        const { allMediaPlayers, allContents, expectedResult, completeContentInfo1, completeContentInfo2 } = setupMockData();

        const foundContents:Map<number, string> = new Map();
        foundContents.set(0, allContents.get(0) as string)
        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockReturnValue(allMediaPlayers);
        mockModelMain.museaClient.tagService.findContentsByTag.mockReturnValue(foundContents);
        mockModelMain.museaClient.tagService.getTagIdsForContent.mockImplementation((mediaStationId:number, contentId:number) =>{
            if(contentId === 0)
                return [12, 3];
            else if(contentId === 1)
                return [];
        });

        mockModelMain.museaClient.mediaService.getMediaType.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return MediaType.IMAGE;
                else if(mediaPlayerId === 1)
                    return null;
            }else if(contentId === 1){
                if(mediaPlayerId === 0)
                    return MediaType.VIDEO;
                else if(mediaPlayerId === 1)
                    return MediaType.IMAGE;
            }
        });

        let receivedData = presenter.findContentsContainingTag(2, 12);

        expect(receivedData.length).toBe(1)
        expect(receivedData[0]).toStrictEqual(completeContentInfo1);
    });
});