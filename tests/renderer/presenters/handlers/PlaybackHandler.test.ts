import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {PlaybackHandler} from "renderer/presenters/handlers/PlaybackHandler";
import {PlaybackData} from "renderer/models/PlaybackData";

describe("PlaybackHandler", () => {
    let handler: PlaybackHandler;
    let playbackData: PlaybackData;
    let onAdvance: jest.Mock;
    let onEnded: jest.Mock;
    let onAdjust: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(global, "setInterval");
        jest.spyOn(global, "clearInterval");
        handler = new PlaybackHandler();
        playbackData = new PlaybackData();
        onAdvance = jest.fn();
        onEnded = jest.fn();
        onAdjust = jest.fn();
        handler.init(onAdvance, onEnded, onAdjust);
    });

    afterEach(() => {
        jest.resetAllMocks();
    })

    describe("start()", () => {
        it("initializes playback data and starts ticking", () => {
            handler.start(playbackData, 5); // 5 seconds total

            // Interval should be scheduled every 10ms
            expect(setInterval).toHaveBeenCalledTimes(1);
            expect((setInterval as unknown as jest.Mock).mock.calls[0][1]).toBe(10);

            // Before time passes nothing called
            expect(onAdvance).not.toHaveBeenCalled();

            // After 10ms one tick increments by 10ms and calls onAdvance
            jest.advanceTimersByTime(10);
            expect(onAdvance).toHaveBeenCalledTimes(1);
            expect(playbackData.playPositionMSec).toBe(10);
            expect(playbackData.playing).toBe(true);
            expect(playbackData.endReached).toBe(false);
            expect(playbackData.fastFordwardOrBack).toBe(false);
        });

        it("fires media ended when reaching the end and pauses", () => {
            handler.start(playbackData, 1); // 1000ms total
            jest.advanceTimersByTime(1000);
            expect(onEnded).toHaveBeenCalledTimes(1);
            expect(playbackData.playPositionMSec).toBe(1000);
            expect(playbackData.endReached).toBe(true);
            // pause() clears the interval
            expect(clearInterval).toHaveBeenCalled();
        });

        it("calls adjustment callback every 10 seconds while not fast-forwarding/rewinding", () => {
            handler.start(playbackData, 25); // 25s total
            // Just before 10s: no adjustment call
            jest.advanceTimersByTime(9990);
            expect(onAdjust).not.toHaveBeenCalled();

            // At 10s: first adjustment
            jest.advanceTimersByTime(10);
            expect(onAdjust).toHaveBeenCalledTimes(1);
            expect(onAdjust).toHaveBeenLastCalledWith(10_000);

            // At 20s: second adjustment
            jest.advanceTimersByTime(10_000);
            expect(onAdjust).toHaveBeenCalledTimes(2);
            expect(onAdjust).toHaveBeenLastCalledWith(20_000);
        });
    });

    describe("pause()", () => {
        it("pauses playback and clears interval", () => {
            handler.start(playbackData, 5);
            jest.advanceTimersByTime(50);
            const posBeforePause = playbackData.playPositionMSec;

            handler.pause();
            expect(playbackData.playing).toBe(false);
            expect(playbackData.fastFordwardOrBack).toBe(false);
            expect(clearInterval).toHaveBeenCalled();

            jest.advanceTimersByTime(100);
            // No further advancement after pause
            expect(playbackData.playPositionMSec).toBe(posBeforePause);
        });

        it("throws if called before start()", () => {
            expect(() => handler.pause()).toThrow(/_playbackData is not set/i);
        });
    });

    describe("resume()", () => {
        it("resumes playback, re-schedules interval, and continues advancing", () => {
            handler.start(playbackData, 5);
            jest.advanceTimersByTime(100); // 100ms elapsed
            const posBeforePause = playbackData.playPositionMSec;

            handler.pause();
            jest.advanceTimersByTime(200); // paused time shouldn't advance

            handler.resume();
            expect(playbackData.playing).toBe(true);
            expect(setInterval).toHaveBeenCalledTimes(2); // one for start, one for resume

            jest.advanceTimersByTime(20);
            expect(playbackData.playPositionMSec).toBe(posBeforePause + 20);
        });

        it("throws if called before start()", () => {
            expect(() => handler.resume()).toThrow(/_playbackData is not set/i);
        });
    });

    describe("stop()", () => {
        it("pauses and resets the playhead to 0", () => {
            handler.start(playbackData, 5);
            jest.advanceTimersByTime(200);
            expect(playbackData.playPositionMSec).toBeGreaterThan(0);

            handler.stop();

            expect(playbackData.playing).toBe(false);
            expect(playbackData.playPositionMSec).toBe(0);
            expect(clearInterval).toHaveBeenCalled();
        });

        it("throws if called before start()", () => {
            expect(() => handler.stop()).toThrow(/_playbackData is not set/i);
        });
    });

    describe("playDoubleSpeed()", () => {
        it("doubles the advancement per tick and sets fast-forward flag", () => {
            handler.start(playbackData, 5);
            jest.advanceTimersByTime(100); // 100ms -> +100
            const pos = playbackData.playPositionMSec;

            handler.playDoubleSpeed();
            expect(playbackData.fastFordwardOrBack).toBe(true);
            // Reschedules interval
            expect(setInterval).toHaveBeenCalledTimes(2);

            jest.advanceTimersByTime(50); // 5 ticks -> +20 each tick -> +100
            expect(playbackData.playPositionMSec).toBe(pos + 100);
            // onAdjust should not be called while fast-forwarding
            expect(onAdjust).not.toHaveBeenCalled();
        });

        it("throws if called before start()", () => {
            expect(() => handler.playDoubleSpeed()).toThrow(/_playbackData is not set/i);
        });
    });

    describe("rewindDoubleSpeed()", () => {
        it("rewinds by 20ms per tick, not below 0, and clears endReached", () => {
            handler.start(playbackData, 5);
            jest.advanceTimersByTime(200); // reach some positive position
            expect(playbackData.playPositionMSec).toBeGreaterThan(0);

            handler.rewindDoubleSpeed();
            expect(playbackData.fastFordwardOrBack).toBe(true);
            expect(playbackData.endReached).toBe(false);

            // Rewind some time
            const posBefore = playbackData.playPositionMSec;
            jest.advanceTimersByTime(50); // 5 ticks -> -20 each -> -100
            expect(playbackData.playPositionMSec).toBe(Math.max(0, posBefore - 100));

            // Rewind past zero should clamp at 0
            jest.advanceTimersByTime(10_000); // plenty to go negative
            expect(playbackData.playPositionMSec).toBe(0);
        });

        it("throws if called before start()", () => {
            expect(() => handler.rewindDoubleSpeed()).toThrow(/_playbackData is not set/i);
        });
    });

    describe("end-of-media behavior", () => {
        it("does not call onAdvance after media has ended", () => {
            handler.start(playbackData, 1);
            jest.advanceTimersByTime(1000);
            const callsAtEnd = onAdvance.mock.calls.length;

            jest.advanceTimersByTime(100);
            expect(onAdvance).toHaveBeenCalledTimes(callsAtEnd); // no more after ended
        });
    });
});