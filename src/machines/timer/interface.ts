export interface ITimerState {
  states: {
    pending: {};
    running: {};
    paused: {};
    stopped: {};
    done: {};
  };
}

export type TTimerEvent =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "LAP" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "RESET" }
  | { type: "UPDATE" };

export interface ITimerContext {
  /**
   * The context config object fields are used to control how the timer operates.
   */
  config: {
    title?: string;
    /**
     * When set:
     *   Acts as a countdown timer that stops when done.
     *   In this mode generates the remaining_ms field too.
     *
     * When not set:
     *   Acts as a stopwatch, that never stops.
     *   In this mode the remaining_ms field is not used.
     */
    duration_ms?: number;
    /**
     * Indicates how often (in milliseconds) the timer is to be updated.
     * If the UI is to show tenths of a second for instance then this value
     * should be equally smaller, i.e. set to 100 ms
     * @default 1000
     */
    update_freq_ms?: number;
    /**
     * When set:
     *   Automatically starts the timer when the machine is invoked.
     *
     * When not set:
     *   Waits in pending state until the START event is received before starting
     *   the timer.
     */
    auto_start?: boolean;
    /**
     * Defines whether the machine is to end up in the "done" state or not, when
     * stopped (or countdown finished). The "done" state is declared as "type: 'final'",
     * meaning that if it is a child-machine then the parent machine will be
     * automatically notified and can also behave accordingly.
     *
     * When set:
     *   Finalize the machine when stopped (stopwatch) or finished (countdown)
     *
     * When not set:
     *   Keep the machine in the stopped state, where a RESET event can be issued to
     *   "recycle" the machine and start over.
     */
    auto_finalize?: boolean; // Moves the machine "done" final-state when set.
  };

  // The following fields are meant for the creator of the timer machine.
  // To use for displaying in the UI for instance.
  /**
   * Array of timestamps for when the timer has started.
   */
  start_times?: number[];
  /**
   * Array of timestamps for when the timer has stopped.
   */
  stop_times?: number[];
  /**
   * Indicates how long has the timer been running.
   */
  elapsed_ms?: number;
  /**
   * Indicates hot long remaining time there is. Only in use when the input-duration is given.
   */
  remaining_ms?: number;
  /**
   * The following fields are meant for internal use in the machine, and probably
   * does not provide value for the outside machine creator.
   * @private
   */
  _: {
    /**
     * Internally used to count the last duration from started to stopped.
     */
    elapsed_last_ms?: number;
    /**
     * The timestamp set once for every action-chain, in order to use the same Date.now() value
     */
    now?: number;
  };
}

/**
 * These are the default values that are merged into the context when the machine is instantiated.
 * This default object is reapplied in the case of a RESET event.
 */
export const DEFAULT: ITimerContext = {
  config: {
    update_freq_ms: 1000,
    auto_start: true,
    auto_finalize: true
  },
  start_times: [],
  stop_times: [],
  elapsed_ms: undefined,
  remaining_ms: undefined,
  _: {
    elapsed_last_ms: undefined,
    now: undefined
  }
};
