import {beforeEach, describe, expect, it} from "@jest/globals";
import {PlaybackData} from "renderer/models/PlaybackData.js";
import {MockPlaybackHandler} from "__mocks__/renderer/presenters/MockPlaybackHandler.js";
import {MockInputTimeoutHandler} from "__mocks__/renderer/presenters/MockInputTimeoutHandler.js";
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import {IMediaPlayerData} from "musea-client/renderer";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";

let presenter: PlaybackPresenter;
let mockModelMain: MockModelMain;
let videoPlayBackData: PlaybackData;
let mockPlaybackHandler: MockPlaybackHandler;
let mockInputTimeoutHandler: MockInputTimeoutHandler;

beforeEach(() => {
    mockModelMain = new MockModelMain();
    videoPlayBackData = new PlaybackData();
    mockPlaybackHandler = new MockPlaybackHandler();
    mockInputTimeoutHandler = new MockInputTimeoutHandler();

    presenter = new PlaybackPresenter(mockModelMain, videoPlayBackData, mockInputTimeoutHandler, mockPlaybackHandler);
});

describe("check adjustment-call ", () => {
    const mediaStationId: number = 1;
    let allMediaPlayers: Map<number, IMediaPlayerData> = new Map();
    let mediaPlayerData1: IMediaPlayerData = {ip: "localhost", name: "controller", isController: true};
    let mediaPlayerData2: IMediaPlayerData = {ip: "192.168.2.2", name: "app2", isController: false};
    allMediaPlayers.set(0, mediaPlayerData1)
    allMediaPlayers.set(1, mediaPlayerData2)

    it("when videoPlayBackHandler calls its onAdjustmentCall, send command sync", async () => {
        let onAdjustmentCall: (num:number) => void = (num:number) => {};
        mockPlaybackHandler.init.mockImplementation((onAdvancePlayhead: () => void, onMediaEnded: Function, onAdjustment: (num:number) => void) => {
            onAdjustmentCall = onAdjustment;
        })

        presenter = new PlaybackPresenter(mockModelMain, videoPlayBackData, mockInputTimeoutHandler, mockPlaybackHandler);

        await presenter.play(mediaStationId, 23, true, jest.fn(), jest.fn());
        onAdjustmentCall(2333);

        expect(mockModelMain.museaClient.mediaStationService.sync).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.sync).toHaveBeenCalledWith(mediaStationId, 23, 2333);
    });
});

describe("getMaxDuration() ", () => {
    const mediaStationId: number = 1;

    it("should return the value it got from the museaClient", () => {
        let answer: number;
        mockModelMain.museaClient.contentService.getMaxDuration.mockImplementation((mediaStationId, contentId) => {
            if (mediaStationId === 1 && contentId === 2) {
                return 777;
            }
        });

        answer = presenter.getMaxDuration(mediaStationId, 2);

        expect(answer).toBe(777);
    });
});

describe("sendPlayCommandToMediaPlayers() ", () => {
    const mediaStationId: number = 1;
    const contentId: number = 20;

    it("should call museaClient.sendCommandPlay with correct arguments", async () => {

        await presenter.play(mediaStationId, contentId, true, jest.fn(), jest.fn());

        expect(mockModelMain.museaClient.mediaStationService.play).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.play).toHaveBeenCalledWith(mediaStationId, contentId);
    });

    it("should call inputTimeoutHandler.stop with correct arguments if containsVideoMetaData is true", async () => {

        await presenter.play(mediaStationId, contentId, true, jest.fn(), jest.fn());

        expect(mockInputTimeoutHandler.stopTimeout).toHaveBeenCalledTimes(1);
    });

    it("do not call inputTimeoutHandler.stop if containsVideoMetaData is false", async () => {
        await presenter.play(mediaStationId, contentId, false, jest.fn(), jest.fn());
        expect(mockInputTimeoutHandler.stopTimeout).toHaveBeenCalledTimes(0);
    });

    it("onAdvancePlayhead should be called if videoPlayBackHandler calls its onAdvancePlayHeadCallback", async () => {
        let onAdvancePlayheadCallback = jest.fn();
        let onAdvancePlayheadCall: () => void = () => {};
        mockPlaybackHandler.init.mockImplementation((onAdvancePlayhead: () => void, onMediaEnded: () => void) => {
            onAdvancePlayheadCall = onAdvancePlayhead;
        })

        videoPlayBackData.playPositionMSec = 2000;

        presenter = new PlaybackPresenter(mockModelMain, videoPlayBackData, mockInputTimeoutHandler, mockPlaybackHandler);

        await presenter.play(mediaStationId, contentId, false, onAdvancePlayheadCallback, jest.fn());
        onAdvancePlayheadCall();

        expect(onAdvancePlayheadCallback).toHaveBeenCalledTimes(1);
        expect(onAdvancePlayheadCallback).toHaveBeenCalledWith(videoPlayBackData.playPositionMSec);
    });

    it("onVideoEndedCallback and onAdvancePlayhead should be called if videoPlayBackHandler calls its onVideoEndedCallback", async () => {
        let onVideoEndedCallback = jest.fn();
        let onAdvancePlayheadCallback = jest.fn();
        let onAdvancePlayheadCall;
        let onMediaEndedCall: () => void = () => {};
        mockPlaybackHandler.init.mockImplementation((onAdvancePlayhead: Function, onVideoEnded: () => void) => {
            onAdvancePlayheadCall = onAdvancePlayhead;
            onMediaEndedCall = onVideoEnded;
        })
        presenter = new PlaybackPresenter(mockModelMain, videoPlayBackData, mockInputTimeoutHandler, mockPlaybackHandler);

        await presenter.play(mediaStationId, contentId, false, onAdvancePlayheadCallback, onVideoEndedCallback);
        onMediaEndedCall();

        expect(onAdvancePlayheadCallback).toHaveBeenCalledTimes(1);
        expect(onVideoEndedCallback).toHaveBeenCalledTimes(1);
    });

    it("inputTimeoutHandler.resetAndStartTimeout and videoPlayBackHandler.stopVideo should be called if videoPlayBackHandler calls its onVideoEndedCallback", async () => {
        let onVideoEndedCall: () => void = () => {};
        mockPlaybackHandler.init.mockImplementation((onAdvancePlayhead: Function, onVideoEnded: () => void) => {
            onVideoEndedCall = onVideoEnded;
        })
        presenter = new PlaybackPresenter(mockModelMain, videoPlayBackData, mockInputTimeoutHandler, mockPlaybackHandler);

        await presenter.play(mediaStationId, contentId, false, jest.fn(), jest.fn());
        onVideoEndedCall();

        expect(mockInputTimeoutHandler.resetAndStartTimeout).toHaveBeenCalledTimes(1);
        expect(mockPlaybackHandler.stop).toHaveBeenCalledTimes(1);
    });
});

describe("sendPauseCommandToMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should call museaClient.sendCommandPlay with correct arguments", async () => {
        await presenter.pause(mediaStationId);

        expect(mockModelMain.museaClient.mediaStationService.pause).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.pause).toHaveBeenCalledWith(mediaStationId);
    });

    it("should call videoPlayBackHandler.pauseVideo() and  inputTimeoutHandler.reset()", async () => {
        await presenter.pause(mediaStationId);

        expect(mockInputTimeoutHandler.resetAndStartTimeout).toHaveBeenCalledTimes(1);
        expect(mockPlaybackHandler.pause).toHaveBeenCalledTimes(1);
    });
});

describe("sendStopCommandToMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should call museaClient.sendCommandStop with correct arguments", async () => {
        await presenter.stop(mediaStationId);

        expect(mockModelMain.museaClient.mediaStationService.stop).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.stop).toHaveBeenCalledWith(mediaStationId);
    });

    it("should call videoPlayBackHandler.stopVideo if video is playing", async () => {
        videoPlayBackData.playing = true;
        await presenter.stop(mediaStationId);
        expect(mockPlaybackHandler.stop).toHaveBeenCalledTimes(1);
    });

    it("should call inputTimeoutHandler.resetAndStartTimeout", async () => {
        await presenter.stop(mediaStationId);
        expect(mockInputTimeoutHandler.resetAndStartTimeout).toHaveBeenCalledTimes(1);
    });
});

describe("sendMuteCommandToMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should call museaClient.sendCommandMute with correct arguments", async () => {
        await presenter.mute(mediaStationId);

        expect(mockModelMain.museaClient.mediaStationService.mute).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.mute).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("sendUnmuteCommandToMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should call museaClient.sendCommandUnmute with correct arguments", async () => {
        await presenter.unmute(mediaStationId);

        expect(mockModelMain.museaClient.mediaStationService.unmute).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.unmute).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("sendSetVolumeCommandToMediaPlayers() ", () => {
    const mediaStationId: number = 1;

    it("should call museaClient.sendCommandSetVolume with correct arguments", async () => {
        await presenter.setVolume(mediaStationId, 0.2);

        expect(mockModelMain.museaClient.mediaStationService.setVolume).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.setVolume).toHaveBeenCalledWith(mediaStationId, 0.2);
    });
});

describe("startSeek() ", () => {
    const mediaStationId: number = 1;

    it("should set videoPlayBackData.playPositionMSec to passed value", async () => {
        await presenter.startSeek(mediaStationId, 100);
        expect(videoPlayBackData.playPositionMSec).toBe(100 * 1000);
    });

    it("should call museaClient.seek", async () => {

        await presenter.startSeek(mediaStationId, 100);

        expect(mockModelMain.museaClient.mediaStationService.seek).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.seek).toHaveBeenCalledWith(1, 100);
    });

    it("should set _videoWasPlayingOnStartSeek to the state of the videoPlaybackData.playing", async () => {
        videoPlayBackData.playing = true;
        await presenter.startSeek(mediaStationId, 100);
        expect(presenter["_mediaWasPlayingOnStartSeek"]).toBe(true);
    });

    it("should call videoPlayBackHanlder.pauseVideo and museaClient.pause if the state was playing on seek Start", async () => {
        videoPlayBackData.playing = true;

        await presenter.startSeek(mediaStationId, 100);

        expect(mockPlaybackHandler.pause).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.pause).toHaveBeenCalledTimes(1);
    });
});

describe("seek() ", () => {
    const mediaStationId: number = 1;

    it("should set videoPlayBackData.playPositionMSec to passed value", async () => {
        await presenter.seek(mediaStationId, 100);
        expect(videoPlayBackData.playPositionMSec).toBe(100 * 1000);
    });

    it("should call the advancePlayheadCallback function passed to play()", async () => {
        const advancePlayheadCallback = jest.fn();
        await presenter.play(mediaStationId, 23, true, advancePlayheadCallback, jest.fn());

        await presenter.seek(mediaStationId, 100);

        expect(advancePlayheadCallback).toHaveBeenCalledTimes(1);
        expect(advancePlayheadCallback).toHaveBeenCalledWith(100 * 1000);
    });

    it("should call museaClient.seek", async () => {
        await presenter.seek(mediaStationId, 100);
        expect(mockModelMain.museaClient.mediaStationService.seek).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.seek).toHaveBeenCalledWith(1, 100);
    });
});

describe("endSeek() ", () => {
    const mediaStationId: number = 1;

    it("should set videoPlayBackData.playPositionMSec to passed value", async () => {
        await presenter.endSeek(mediaStationId, 100);
        expect(videoPlayBackData.playPositionMSec).toBe(100 * 1000);
    });

    it("should call videoPlayBackHanlder.resumeVideo and museaClient.play if the state was playing on seek Start", async () => {
        Object.defineProperty(presenter, "_mediaWasPlayingOnStartSeek", {
            get: jest.fn(() => {
                return true
            })
        });

        await presenter.endSeek(mediaStationId, 100);

        expect(mockPlaybackHandler.resume).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.play).toHaveBeenCalledTimes(1);
    });

    it("should NOT call videoPlayBackHanlder.resumeVideo and museaClient.play if the state was paused on seek Start", async () => {
        Object.defineProperty(presenter, "_videoWasPlayingOnStartSeek", {
            get: jest.fn(() => {
                return false
            })
        });

        await presenter.endSeek(mediaStationId, 100);

        expect(mockPlaybackHandler.resume).toHaveBeenCalledTimes(0);
        expect(mockModelMain.museaClient.mediaStationService.play).toHaveBeenCalledTimes(0);
    });

    it("should call museaClient.seek", async () => {
        await presenter.endSeek(mediaStationId, 100);
        expect(mockModelMain.museaClient.mediaStationService.seek).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.seek).toHaveBeenCalledWith(1, 100);
    });
});

describe("resume() ", () => {
    const mediaStationId: number = 1;

    it("should call museaClient.sendCommandPlay", async () => {
        await presenter.resume(mediaStationId, false);
        expect(mockModelMain.museaClient.mediaStationService.play).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.play).toHaveBeenCalledWith(1, null);
    });

    it("should stop timeout and resume the playback-handler if containsVideo = true", async () => {
        await presenter.resume(mediaStationId, true);
        expect(mockPlaybackHandler.resume).toHaveBeenCalledTimes(1);
        expect(mockInputTimeoutHandler.stopTimeout).toHaveBeenCalledTimes(1);
    });

    it("should NOT stop timeout and resume the playback-handler if containsVideo = false", async () => {
        await presenter.resume(mediaStationId, false);
        expect(mockPlaybackHandler.resume).toHaveBeenCalledTimes(0);
        expect(mockInputTimeoutHandler.stopTimeout).toHaveBeenCalledTimes(0);
    });
});