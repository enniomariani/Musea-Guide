export class PlaybackData {

    private _playPositionMSec:number = -1;
    private _totalTimeMSec:number = -1;

    private _playing:boolean = false;
    private _endReached:boolean = false;

    private _fastFordwardOrBack:boolean = false;

    constructor() {}

    get playPositionMSec() {
        return this._playPositionMSec;
    }

    set playPositionMSec(value:number) {
        this._playPositionMSec = value;
        this._endReached = this._playPositionMSec >= this._totalTimeMSec;
    }

    get fastFordwardOrBack() {
        return this._fastFordwardOrBack;
    }

    set fastFordwardOrBack(value:boolean) {
        this._fastFordwardOrBack = value;
    }

    get playing() {
        return this._playing;
    }

    set playing(value:boolean) {
        this._playing = value;
    }

    get endReached() {
        return this._endReached;
    }

    get totalTimeMSec() {
        return this._totalTimeMSec;
    }

    set totalTimeMSec(value:number) {
        this._totalTimeMSec = value;
    }
}