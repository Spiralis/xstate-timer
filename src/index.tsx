import * as React from "react";
import * as ReactDOM from "react-dom";
import { TCreateContext, useMachine } from "use-machine";
import Timer, { MachineContext } from "./components/Timer";

import {
  ITimerContext,
  TTimerEvent,
  ITimerState,
  TimerMachineConfig,
  TimerMethodConfig
} from "./machines/timer";

const timerContext: ITimerContext = {
  config: {
    /**
     * An optional name to add to the timer, (i.e. for showing in the UI).
     */
    title: "Timer example",
    /**
     * When set:
     *   Acts as a countdown timer that stops when done.
     *   In this mode generates the remaining_ms field too.
     *
     * When not set:
     *   Acts as a stopwatch, that never stops.
     *   In this mode the remaining_ms field is not used.
     */
    duration_ms: 10000,

    /**
     * Indicates how often (in milliseconds) the timer is to be updated.
     * If the UI is to show tenths of a second for instance then this value
     * should be equally smaller, i.e. set to 100 ms
     * @default 1000
     */
    update_freq_ms: 100,

    /**
     * When set:
     *   Automatically starts the timer when the machine is invoked.
     *
     * When not set:
     *   Waits in pending state until the START event is received before starting
     *   the timer.
     */
    auto_start: false,

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
    auto_finalize: false // Moves the machine "done" final-state when set.
  }
};

import "./styles.css";

function App() {
  const machine = useMachine<ITimerContext, ITimerState, TTimerEvent>(
    TimerMachineConfig,
    TimerMethodConfig,
    timerContext
  );
  return (
    <MachineContext.Provider value={machine}>
      <Timer />
    </MachineContext.Provider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
