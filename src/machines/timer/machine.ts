import { MachineConfig } from "xstate";
import { ITimerContext, ITimerState, TTimerEvent } from "./interface";

/**
 * Actual timer machine logic
 */
export const TimerMachineConfig: MachineConfig<
  ITimerContext,
  ITimerState,
  TTimerEvent
> = {
  id: "timer",
  initial: "pending",
  states: {
    pending: {
      onEntry: ["setDefaults"],
      on: {
        // If the timer is to auto_start, then automatically transition to the running state.
        "": [{ target: "running", actions: "setDefaults", cond: "autoStart" }],
        START: "running"
      }
    },
    running: {
      invoke: {
        id: "incInterval",
        src: "startIntervalService"
      },
      onEntry: ["setNow", "startTimer"],
      onExit: [
        "setNow",
        "stopTimer",
        "updateLastElapsed",
        "updateElapsedAndRemainingFromStopped"
      ],
      on: {
        PAUSE: "paused",
        STOP: "stopped",
        LAP: {
          actions: [
            "setNow",
            "stopTimer",
            "updateLastElapsed",
            "updateElapsedAndRemainingFromStopped",
            "startTimer"
          ]
        },
        RESET: {
          target: "pending",
          actions: "resetTimer"
        },
        UPDATE: {
          actions: [
            "setNow",
            "updateElapsedFromRunning",
            "updateRemainingFromRunning"
          ]
        }
      }
    },
    paused: {
      on: {
        RESUME: "running",
        STOP: "stopped",
        RESET: {
          target: "pending",
          actions: "resetTimer"
        }
      }
    },
    stopped: {
      onEntry: "setFinal",
      on: {
        "": [{ target: "done", actions: "setFinal", cond: "autoFinalize" }],
        RESET: {
          target: "pending",
          actions: "resetTimer"
        }
      }
    },
    done: {
      type: "final"
    }
  }
};
