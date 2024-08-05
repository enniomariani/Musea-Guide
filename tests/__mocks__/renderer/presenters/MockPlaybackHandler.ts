
import {PlaybackHandler} from "../../../../src/renderer/presenters/handlers/PlaybackHandler";

export class MockPlaybackHandler extends  PlaybackHandler{

    init: jest.Mock;

    start: jest.Mock;
    pause: jest.Mock;
    resume: jest.Mock;
    stop: jest.Mock;

    playDoubleSpeed: jest.Mock;
    rewindDoubleSpeed: jest.Mock;

    constructor() {
        super();

        this.init = jest.fn();

        this.start = jest.fn();
        this.pause = jest.fn();
        this.resume = jest.fn();
        this.stop = jest.fn();

        this.playDoubleSpeed = jest.fn();
        this.rewindDoubleSpeed = jest.fn();
    }
}