import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    DownloadContentsResult,
    DownloadContentsStatus, IViewMediastation,
    MediaStationPresenter
} from "renderer/presenters/MediaStationPresenter";
import {ContentDownloadStatus, IMediaPlayerData} from "musea-client/renderer";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";

export let presenter: MediaStationPresenter;
export let mockModelMain: MockModelMain;

const allMediaPlayers: Map<number, IMediaPlayerData> = new Map();
allMediaPlayers.set(0, {ip: "192.168.0.1", name: "media-app 1", isController: true});
allMediaPlayers.set(1, {ip: "192.168.0.2", name: "media-app 2", isController: false});

beforeEach(() => {
    mockModelMain = new MockModelMain();
    presenter = new MediaStationPresenter(mockModelMain);
});

describe("loadSavedMediaStations() ", () => {
    it("should map loaded stations to view models with incremental ids starting at 0 and status=false", async () => {
        const map = new Map<string, string>();
        // key: stationName, value: controllerIp (insertion order preserved)
        map.set("Zweite Station", "192.168.0.2");
        map.set("Erste Station", "127.0.0.1");
        mockModelMain.museaClient.mediaStationService.loadMediaStations.mockResolvedValueOnce(map);

        // method to test
        const result: IViewMediastation[] = await presenter.loadSavedMediaStations();

        // tests
        expect(result).toHaveLength(2);
        expect(result[0]).toStrictEqual({id: 0, title: "Zweite Station", status: false});
        expect(result[1]).toStrictEqual({id: 1, title: "Erste Station", status: false});
    });

    it("should return an empty array when no stations are saved", async () => {
        const empty = new Map<string, string>();
        mockModelMain.museaClient.mediaStationService.loadMediaStations.mockResolvedValueOnce(empty);

        // method to test
        const result: IViewMediastation[] = await presenter.loadSavedMediaStations();

        // tests
        expect(result).toStrictEqual([]);
    });
});


describe("checkOnlineStatusOfAllMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should return the value of museaClient.checkOnlineStatusOfAllMediaPlayers", async () => {
        let answer: boolean;
        mockModelMain.museaClient.mediaPlayerConnectionService.checkOnlineStatusOfAllMediaPlayers.mockImplementation(async (id: number) => {
            if (id === mediaStationId)
                return true;
            return false;
        })

        answer = await presenter.checkOnlineStatusOfAllMediaPlayers(mediaStationId);

        expect(answer).toBe(true);
    });
});


describe("connnectAndRegisterAllMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should call connectAndRegisterToMediaPlayer for all media apps in the mediastation", async () => {
        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockImplementation((id:number) => {
            if (id === mediaStationId)
                return allMediaPlayers;
            else
                return null;
        })

        await presenter.connnectAndRegisterAllMediaPlayers(mediaStationId);

        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledTimes(2);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledWith(1, 0);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledWith(1, 1);
    });
});

describe("unregisterAndCloseAllMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should call unregisterAndCloseMediaPlayer for all media apps in the mediastation", async () => {
        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockImplementation((id:number) => {
            if (id === mediaStationId)
                return allMediaPlayers;
            else
                return null;
        })

        await presenter.unregisterAndCloseAllMediaPlayers(mediaStationId);

        expect(mockModelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer).toHaveBeenCalledTimes(2);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer).toHaveBeenCalledWith(1, 0);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer).toHaveBeenCalledWith(1, 1);
    });
});

describe("downloadContents() ", () => {
    const ip: string = "127.0.0.1"

    it("should return DownloadContentsStatus.Success if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_SUCCESS", async () => {
        let answer: DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce((id: number) => {
            return ip;
        });
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({
            status: ContentDownloadStatus.Success,
            ip: ip
        });

        answer = await presenter.downloadContents(1);

        expect(answer.status).toBe(DownloadContentsStatus.Success);
    });

    it("should return DownloadContentsStatus.NoContentsOnController if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER", async () => {
        let answer: DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce((id: number) => {
            return ip;
        })
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({
            status: ContentDownloadStatus.SuccessNoContentsOnController,
            ip: ip
        });

        answer = await presenter.downloadContents(1);

        expect(answer.status).toBe(DownloadContentsStatus.NoContentsOnController);
    });

    it("should return DownloadContentsStatus.NoControllerIp if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP", async () => {
        let answer: DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({
            status: ContentDownloadStatus.FailedNoControllerIp,
            ip: ip
        });

        answer = await presenter.downloadContents(1);

        expect(answer.status).toBe(DownloadContentsStatus.NoControllerIp);
    });

    it("should return DownloadContentsResult with NoControllerIp if mediaStationDataService.getControllerIp returns null", async () => {
        let answer: DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce((id: number) => {
            return null;
        })

        answer = await presenter.downloadContents(1);

        expect(answer.status).toBe(DownloadContentsStatus.NoControllerIp);
    });

    it("should return DownloadContentsResult with NoResponseFromController + ip-address if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM", async () => {
        let answer: DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce((id: number) => {
            return ip;
        })
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({
            status: ContentDownloadStatus.FailedNoResponseFrom,
            ip: ip
        });

        answer = await presenter.downloadContents(1);

        expect(answer.status).toBe(DownloadContentsStatus.NoResponseFromController);
        expect(answer.params?.ip).toBe(ip);
    });
});

describe("getName() ", () => {
    const mediaStationId: number = 1;

    it("should return the name it got from the museaClient", () => {
        const name: string = "newName";
        mockModelMain.museaClient.mediaStationService.getMediaStationName.mockReturnValue(name);
        const answer:string = presenter.getName(mediaStationId);
        expect(answer).toStrictEqual(name);
    });
});

describe("sync() ", () => {
    const mediaStationId: number = 1;

    it("should call the museaClient.sync method with the passed arguments", () => {
        let onSyncStep = jest.fn();

        presenter.sync(mediaStationId, onSyncStep);

        expect(mockModelMain.museaClient.mediaStationService.syncMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.syncMediaStation).toHaveBeenCalledWith(mediaStationId, onSyncStep);
    });
});