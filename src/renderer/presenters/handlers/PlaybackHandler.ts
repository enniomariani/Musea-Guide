import {PlaybackData} from "renderer/models/PlaybackData.js";

export class PlaybackHandler {
    private _callbackAdvancePlayback: (() => void) | null = null;
    private _callbackMediaEnded: (() => void) | null = null;
    private _callbackAdjustmentCall: ((playHeadPosMSec: number) => void) | null = null;

    private _intervalID: number | undefined = undefined;

    private _intervalTimeMS: number = 10;
    private _increasePlayHeadPerInterval: number = 10;

    private _playbackData: PlaybackData | null = null;

    private _adjustmentCallsForServers: number = -1;

    private _onAdvancePlayheadFunc: Function = this._onAdvancePlayhead.bind(this);

    constructor() {}

    init(onAdvancePlayhead: () => void, onMediaEnded: () => void, onAdjustmentCall: (playHeadPosMSec: number) => void) {
        this._callbackAdvancePlayback = onAdvancePlayhead;
        this._callbackMediaEnded = onMediaEnded;
        this._callbackAdjustmentCall = onAdjustmentCall;
    }

    /**
     * start the playback of a media, has to be called before any other methods like pause/stop/forward/etc. are called
     * has to be called after the init() function
     *
     * @param {PlaybackData} playbackData
     * @param {number} totalTimeSec
     */
    start(playbackData: PlaybackData, totalTimeSec: number) {
        this._playbackData = playbackData;

        this._increasePlayHeadPerInterval = 10;

        this._playbackData.totalTimeMSec = totalTimeSec * 1000;
        this._playbackData.playPositionMSec = 0;
        this._playbackData.fastFordwardOrBack = false;
        this._playbackData.playing = true;

        this._adjustmentCallsForServers = 1;

        if (this._intervalID)
            clearInterval(this._intervalID);

        this._intervalID = setInterval(this._onAdvancePlayheadFunc, this._intervalTimeMS);
    }

    pause() {
        if (!this._playbackData)
            throw new Error("_playbackData is not set! Call play() before pause() and pass a PlaybackData-object to start()");

        this._playbackData.fastFordwardOrBack = false;
        this._playbackData.playing = false;
        clearInterval(this._intervalID);
    }

    resume() {
        if (!this._playbackData)
            throw new Error("_playbackData is not set! Call play() before resume() and pass a PlaybackData-object to start()");

        this._increasePlayHeadPerInterval = 10;
        this._playbackData.fastFordwardOrBack = false;
        this._playbackData.playing = true;

        this._adjustmentCallsForServers = Math.floor(this._playbackData.playPositionMSec / 1000 / 10) + 1;

        clearInterval(this._intervalID);
        this._intervalID = setInterval(this._onAdvancePlayheadFunc, this._intervalTimeMS);
    }

    stop() {
        if (!this._playbackData)
            throw new Error("_playbackData is not set! Call play() before stop() and pass a PlaybackData-object to start()");

        this.pause();
        this._playbackData.playPositionMSec = 0;
    }

    playDoubleSpeed() {
        if (!this._playbackData)
            throw new Error("_playbackData is not set! Call play() before playDoubleSpeed() and pass a PlaybackData-object to start()");

        this._playbackData.fastFordwardOrBack = true;
        this._increasePlayHeadPerInterval = 20;

        clearInterval(this._intervalID);
        this._intervalID = setInterval(this._onAdvancePlayheadFunc, this._intervalTimeMS);
    }

    rewindDoubleSpeed() {
        if (!this._playbackData)
            throw new Error("_playbackData is not set! Call play() before rewindDoubleSpeed() and pass a PlaybackData-object to start()");

        this._playbackData.fastFordwardOrBack = true;
        this._increasePlayHeadPerInterval = -20;

        clearInterval(this._intervalID);
        this._intervalID = setInterval(this._onAdvancePlayheadFunc, this._intervalTimeMS);
    }

    private _onAdvancePlayhead() {
        this._playbackData!.playPositionMSec += this._increasePlayHeadPerInterval;

        if (this._playbackData!.playPositionMSec < 0)
            this._playbackData!.playPositionMSec = 0;

        if (this._playbackData!.playPositionMSec >= this._playbackData!.totalTimeMSec) {
            this._playbackData!.playPositionMSec = this._playbackData!.totalTimeMSec;
            this.pause();

            if (this._callbackMediaEnded)
                this._callbackMediaEnded();

        } else {

            if (!this._playbackData!.fastFordwardOrBack && this._playbackData!.playPositionMSec >= this._adjustmentCallsForServers * 10000) {
                if (this._callbackAdjustmentCall)
                    this._callbackAdjustmentCall(this._playbackData!.playPositionMSec);

                this._adjustmentCallsForServers++;
            }

            if (this._callbackAdvancePlayback)
                this._callbackAdvancePlayback();
        }
    }
}