import * as React from "react";
import { useContext } from "react";
import { TCreateContext, useMachine } from "use-machine";
import { send } from "xstate";
import {
  ITimerContext,
  TTimerEvent,
  ITimerState,
  TimerMachineConfig,
  TimerMethodConfig
} from "../machines/timer";

import { MachineContext } from "./createContext";
export { MachineContext };

export default function Timer() {
  const { state, context, send } = useContext(MachineContext);
  const startEnabled = state.matches("pending");
  const pauseEnabled = state.matches("running");
  const lapEnabled = state.matches("running");
  const resumeEnabled = state.matches("paused");
  const stopEnabled = state.matches("running") || state.matches("paused");
  const resetEnabled =
    state.matches("running") ||
    state.matches("paused") ||
    state.matches("stopped");

  let pairs: {
    started: number;
    stopped?: number;
  }[] = [];

  let start_times = context.start_times || [];
  for (let i = 0; i < start_times.length; i++) {
    let started = start_times[i];
    let stopped =
      context.stop_times && context.stop_times.length > i
        ? context.stop_times[i]
        : undefined;
    pairs.push({ started, stopped });
  }
  const pauseResumeCommand = pauseEnabled ? "PAUSE" : "RESUME";

  return (
    <div className="timer">
      <h1>{context.config.title}</h1>
      <h2>
        Duration:{" "}
        {context.config.duration_ms
          ? toTimeString(context.config.duration_ms) +
            " (" +
            context.config.duration_ms +
            "ms)"
          : "No limit"}
      </h2>
      <hr />
      <div className="controls">
        <button disabled={!startEnabled} onClick={() => send("START")}>
          START
        </button>
        <button
          disabled={!pauseEnabled && !resumeEnabled}
          onClick={() => send(pauseResumeCommand)}>
          {pauseResumeCommand}
        </button>
        <button disabled={!lapEnabled} onClick={() => send("LAP")}>
          LAP
        </button>
        <button disabled={!stopEnabled} onClick={() => send("STOP")}>
          STOP
        </button>
        <button disabled={!resetEnabled} onClick={() => send("RESET")}>
          RESET
        </button>
      </div>
      <hr />
      <table className="status">
        <tbody>
          <tr>
            <th>Elapsed</th>
            <th>Remaining</th>
          </tr>
          <tr>
            <td>{toTimeString(context.elapsed_ms || 0)}</td>
            <td>{toTimeString(context.remaining_ms || 0, true, true)}</td>
          </tr>
          <tr>
            <td>{context.elapsed_ms}ms</td>
            <td>{context.remaining_ms}ms</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <div className="state">
        <b>State:</b> {state.value}
      </div>
      <hr />
      <table className="events">
        <tbody>
          <tr>
            <th>Started</th>
            <th>Stopped</th>
            <th>Duration</th>
          </tr>
          {pairs.map((p, i) => {
            return (
              <tr key={i}>
                <td>{toTimeString(p.started, false)}</td>
                <td>{p.stopped && toTimeString(p.stopped, false)}</td>
                <td>
                  {p.stopped && toTimeString(p.stopped - p.started, false)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Used to humanize/prettify the elapsed and remaining milliseconds.
 */
function toTimeString(
  time_ms: number,
  strip_fractions: boolean = true,
  countdown: boolean = false
) {
  let sec_num: number = time_ms / 1000;
  let hours: number = Math.floor(sec_num / 3600);
  let minutes: number = Math.floor((sec_num - hours * 3600) / 60);
  let seconds: number = sec_num - hours * 3600 - minutes * 60;

  // Correct for countdown scenarios, where the seconds is not supposed to countdown until it
  // has elapsed, as opposed to on normal count that increments the seconds when it reaches the amount.
  // Seconds from 1.999 in a clock (countup) is 1.
  // Seconds from 1.999 in a timer (countdown) is 2.
  // Not adding a full second (1000ms), as it will then potentially incorrectly increase the seconds
  // to one more second than the max was supposed to be.
  if (countdown && strip_fractions) seconds = Math.ceil(seconds);

  let out_hours: string = hours < 10 ? `0${hours}` : hours.toString();
  let out_mins: string = minutes < 10 ? `0${minutes}` : minutes.toString();
  let out_secs: string = seconds < 10 ? `0${seconds}` : seconds.toString();

  if (out_secs.length === 2) out_secs = `${out_secs}.`;
  out_secs = out_secs.padEnd(6, "0");

  if (strip_fractions) out_secs = out_secs.substr(0, 2);

  return `${out_hours}:${out_mins}:${out_secs}`;
}
