import {PlaybackData} from "renderer/models/PlaybackData.js";
import {InputTimeoutHandler} from "renderer/presenters/handlers/InputTimeoutHandler.js";
import {PlaybackHandler} from "renderer/presenters/handlers/PlaybackHandler.js";
import {ModelMain} from "renderer/models/ModelMain.js";

export class PlaybackPresenter {
    private _modelMain: ModelMain;
    private _playbackData: PlaybackData;
    private _playbackHandler: PlaybackHandler;

    private _actualMediaStationId: number = -1;

    private _mediaWasPlayingOnStartSeek: boolean = false;

    private _onAdvancePlayheadCallback: ((timeInMs: number) => void) | null = null;
    private _onMediaEndedCallback:  (() => void) | null = null;

    private _inputTimeoutHandler: InputTimeoutHandler;

    private _actualContentId: number = -1;

    constructor(modelMain: ModelMain, playbackData: PlaybackData, inputTimeoutHandler: InputTimeoutHandler, videoPlayBackHandler: PlaybackHandler = new PlaybackHandler()) {
        this._modelMain = modelMain;
        this._playbackData = playbackData;
        this._playbackHandler = videoPlayBackHandler;

        this._playbackHandler.init(this._onAdvancePlayhead.bind(this), this._onMediaEnded.bind(this), this._onAdjustmentCall.bind(this));

        this._inputTimeoutHandler = inputTimeoutHandler;
    }

    /**
     * if no contentId is passed, the actual playing content is resumed where it was paused
     */
    async play(mediaStationId: number, contentId: number, containsVideoMedia: boolean, onAdvancePlayhead: (timeInMs: number)=> void, onVideoEnded: ()=> void): Promise<void> {
        this._onAdvancePlayheadCallback = onAdvancePlayhead;
        this._onMediaEndedCallback = onVideoEnded;
        this._actualMediaStationId = mediaStationId;

        this._actualContentId = contentId;

        if (containsVideoMedia) {
            this._playbackHandler.start(this._playbackData, this._modelMain.museaClient.contentService.getMaxDuration(mediaStationId, contentId));
            this._inputTimeoutHandler.stopTimeout();
        }

        await this.setVolume(mediaStationId, 0.5);
        await this._modelMain.museaClient.mediaStationService.play(mediaStationId, contentId);
    }

    isPlaying(): boolean {
        return this._playbackData.playing;
    }

    async resume(mediaStationId: number, containsVideoMedia: boolean): Promise<void> {
        if (containsVideoMedia) {
            this._playbackHandler.resume();
            this._inputTimeoutHandler.stopTimeout();
        }
        await this._modelMain.museaClient.mediaStationService.play(mediaStationId,null);
    }

    private async _onAdjustmentCall(playHeadPosMSec: number): Promise<void> {
        await this._modelMain.museaClient.mediaStationService.sync(this._actualMediaStationId, this._actualContentId, playHeadPosMSec);
    }

    private _onAdvancePlayhead() {
        if (this._onAdvancePlayheadCallback)
            this._onAdvancePlayheadCallback(this._playbackData.playPositionMSec);
    }

    private _onMediaEnded() {
        this._actualContentId = -1;

        if (this._onAdvancePlayheadCallback)
            this._onAdvancePlayheadCallback(this._playbackData.playPositionMSec);

        this._inputTimeoutHandler.resetAndStartTimeout();
        this._playbackHandler.stop();

        if (this._onMediaEndedCallback)
            this._onMediaEndedCallback();
    }

    async startSeek(mediaStationId: number, newPositionSec: number): Promise<void> {
        this._mediaWasPlayingOnStartSeek = this._playbackData.playing;

        this._playbackData.playPositionMSec = newPositionSec * 1000;

        if (this._playbackData.playing) {
            this._playbackHandler.pause();
            await this._modelMain.museaClient.mediaStationService.pause(mediaStationId);
        }

        await this._modelMain.museaClient.mediaStationService.seek(mediaStationId, newPositionSec);
    }

    async seek(mediaStationId: number, newPositionSec: number): Promise<void> {
        this._playbackData.playPositionMSec = newPositionSec * 1000;

        if (this._onAdvancePlayheadCallback)
            this._onAdvancePlayheadCallback(this._playbackData.playPositionMSec);

        await this._modelMain.museaClient.mediaStationService.seek(mediaStationId, newPositionSec);
    }

    async endSeek(mediaStationId: number, newPositionSec: number): Promise<void> {
        this._playbackData.playPositionMSec = newPositionSec * 1000;

        await this._modelMain.museaClient.mediaStationService.seek(mediaStationId, newPositionSec);

        if (this._mediaWasPlayingOnStartSeek) {
            this._playbackHandler.resume();
            await this._modelMain.museaClient.mediaStationService.play(mediaStationId, null);
        }
    }

    async pause(mediaStationId: number): Promise<void> {
        this._playbackHandler.pause();
        this._inputTimeoutHandler.resetAndStartTimeout();

        await this._modelMain.museaClient.mediaStationService.pause(mediaStationId);
    }

    async stop(mediaStationId: number): Promise<void> {
        this._actualContentId = -1;

        if (this._playbackData.playing)
            this._playbackHandler.stop();

        this._inputTimeoutHandler.resetAndStartTimeout();

        await this._modelMain.museaClient.mediaStationService.stop(mediaStationId);
    }

    async mute(mediaStationId: number): Promise<void> {
        await this._modelMain.museaClient.mediaStationService.mute(mediaStationId);
    }

    async unmute(mediaStationId: number): Promise<void> {
        await this._modelMain.museaClient.mediaStationService.unmute(mediaStationId);
    }

    async setVolume(mediaStationId: number, volume: number): Promise<void> {
        await this._modelMain.museaClient.mediaStationService.setVolume(mediaStationId, volume);
    }

    getMaxDuration(mediaStationId: number, contentId: number): number {
        return Math.floor(this._modelMain.museaClient.contentService.getMaxDuration(mediaStationId, contentId));
    }
}