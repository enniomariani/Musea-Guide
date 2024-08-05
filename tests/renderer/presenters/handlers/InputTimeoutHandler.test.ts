import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {InputTimeoutHandler} from "renderer/presenters/handlers/InputTimeoutHandler";

let handler:InputTimeoutHandler;

describe("InputTimeoutHandler", () => {
    beforeEach(() => {
        handler = new InputTimeoutHandler();

        jest.useFakeTimers();
        jest.spyOn(global, "setTimeout");
        jest.spyOn(global, "clearTimeout");
    });

    it("schedules the timeout in milliseconds based on seconds passed to init()", () => {
        const onTimeout = jest.fn();

        handler.init(5, onTimeout);
        handler.resetAndStartTimeout();

        expect(setTimeout).toHaveBeenCalledTimes(1);
        // First arg is a function, second is delay in ms
        const args = (setTimeout as unknown as jest.Mock).mock.calls[0];
        expect(typeof args[0]).toBe("function");
        expect(args[1]).toBe(5000);

        // advancing less than 5s should not trigger
        jest.advanceTimersByTime(4999);
        expect(onTimeout).not.toHaveBeenCalled();

        // advancing to 5s triggers the callback
        jest.advanceTimersByTime(1);
        expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it("clear previous timeout when resetAndStartTimeout() is called again", () => {
        const onTimeout = jest.fn();

        handler.init(10, onTimeout);
        handler.resetAndStartTimeout(); // schedules first timeout
        handler.resetAndStartTimeout(); // should clear the first and schedule a new one

        expect(clearTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledTimes(2);

        // Only the latest timer should fire once we advance the full duration
        jest.advanceTimersByTime(10_000);
        expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it("stopTimeout() cancels a pending timeout and prevents the callback from firing", () => {
        const onTimeout = jest.fn();

        handler.init(1, onTimeout);
        handler.resetAndStartTimeout();
        expect(setTimeout).toHaveBeenCalledTimes(1);

        handler.stopTimeout();
        expect(clearTimeout).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1000);
        expect(onTimeout).not.toHaveBeenCalled();
    });

    it("stopTimeout() is safe to call when no timeout is active", () => {
        const onTimeout = jest.fn();

        handler.init(2, onTimeout);
        handler.stopTimeout(); // no timer yet -> should not call clearTimeout

        expect(clearTimeout).not.toHaveBeenCalled();

        // Start and stop again to ensure no side effects
        handler.resetAndStartTimeout();
        expect(setTimeout).toHaveBeenCalledTimes(1);
        handler.stopTimeout();
        expect(clearTimeout).toHaveBeenCalledTimes(1);
    });
});