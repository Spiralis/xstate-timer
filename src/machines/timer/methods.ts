import {
  assign,
  MachineOptions,
  InvokeCreator,
  InvokeCallback,
  Receiver,
  EventObject
} from "xstate";
import { DEFAULT, ITimerContext, TTimerEvent } from "./interface";

// Actions, Guards, Services, Activities
/**
 * Sets the defaults on machine instantiation.
 */
const setDefaults = assign<ITimerContext, TTimerEvent>({
  ...DEFAULT,
  config: ctx => ({
    ...DEFAULT.config,
    ...ctx.config
  }),
  _: ctx => ({
    ...DEFAULT._,
    ...ctx._
  })
});

/**
 *
 */
const autoStart = (ctx: ITimerContext, event: TTimerEvent) => {
  return ctx.config.auto_start !== undefined
    ? ctx.config.auto_start
    : (DEFAULT.config.auto_start as boolean);
};

const autoFinalize = (ctx: ITimerContext, event: TTimerEvent) => {
  return ctx.config.auto_finalize as boolean;
};

const setNow = assign<ITimerContext, TTimerEvent>({
  _: ctx => ({
    ...ctx._,
    now: Date.now()
  })
});

const startTimer = assign<ITimerContext, TTimerEvent>({
  start_times: ctx => (ctx.start_times || []).concat(ctx._.now || 0)
});

const updateLap = assign<ITimerContext, TTimerEvent>({
  elapsed_ms: ctx =>
    (ctx._.elapsed_last_ms || 0) +
    (ctx._.now || 0) -
    (ctx.start_times || []).slice(-1)[0]
});

const updateElapsedFromRunning = assign<ITimerContext, TTimerEvent>({
  elapsed_ms: ctx =>
    (ctx._.elapsed_last_ms || 0) +
    (ctx._.now || 0) -
    (ctx.start_times || []).slice(-1)[0]
});

const updateRemainingFromRunning = assign<ITimerContext, TTimerEvent>({
  remaining_ms: ctx =>
    ctx.config.duration_ms
      ? ctx.config.duration_ms - (ctx.elapsed_ms || 0)
      : undefined
});

const stopTimer = assign<ITimerContext, TTimerEvent>({
  stop_times: ctx => (ctx.stop_times || []).concat(ctx._.now || 0)
});

const updateLastElapsed = assign<ITimerContext, TTimerEvent>({
  _: ctx => ({
    ...ctx._,
    elapsed_last_ms:
      (ctx._.elapsed_last_ms || 0) +
      (ctx.stop_times ? ctx.stop_times.slice(-1)[0] : 0) -
      (ctx.start_times ? ctx.start_times.slice(-1)[0] : 0)
  })
});

const updateElapsedAndRemainingFromStopped = assign<ITimerContext, TTimerEvent>(
  {
    elapsed_ms: ctx => ctx._.elapsed_last_ms || 0,
    remaining_ms: ctx =>
      ctx.config.duration_ms
        ? ctx.config.duration_ms - (ctx._.elapsed_last_ms || 0)
        : undefined
  }
);

const setFinal = assign<ITimerContext, TTimerEvent>({
  elapsed_ms: ctx =>
    ctx.config.duration_ms && (ctx.elapsed_ms || 0) > ctx.config.duration_ms
      ? ctx.config.duration_ms
      : ctx.elapsed_ms,
  remaining_ms: ctx =>
    ctx.config.duration_ms
      ? ctx.remaining_ms || 0 < 0
        ? 0
        : ctx.remaining_ms
      : undefined
});

const resetTimer = assign<ITimerContext, TTimerEvent>({
  start_times: undefined,
  stop_times: undefined,
  elapsed_ms: undefined,
  remaining_ms: undefined,
  _: ctx => ({
    ...ctx._,
    elapsed_last_ms: undefined,
    now: undefined
  })
});

const startIntervalService: InvokeCreator<any, ITimerContext> = (
  ctx,
  event
): InvokeCallback => (
  callback: (ev: TTimerEvent) => void,
  onEvent: Receiver<EventObject>
) => {
  console.log("Setting up timers");
  let stopTimer: NodeJS.Timer;
  if (ctx.config.duration_ms) {
    // This will send an STOP event to the parent, when and if the timer completes
    const STOP: TTimerEvent = { type: "STOP" };
    stopTimer = setTimeout(
      () => callback(STOP),
      ctx.config.duration_ms - (ctx._.elapsed_last_ms || 0)
    );
  }

  // This will send the 'UPDATE' event to the parent according to set frequency
  const UPDATE: TTimerEvent = { type: "UPDATE" };
  const updateTimer = setInterval(
    () => callback(UPDATE),
    ctx.config.update_freq_ms //|| DEFAULT.config.update_freq_ms
  );

  // Perform cleanup
  return () => {
    console.log("Cleaning up timers");
    clearInterval(updateTimer);
    if (stopTimer) clearTimeout(stopTimer);
  };
};

export const TimerMethodConfig: MachineOptions<ITimerContext, TTimerEvent> = {
  actions: {
    setDefaults,
    setNow,
    updateLap,
    startTimer,
    updateLastElapsed,
    stopTimer,
    updateElapsedFromRunning,
    updateRemainingFromRunning,
    updateElapsedAndRemainingFromStopped,
    resetTimer,
    setFinal
  },
  guards: {
    autoStart,
    autoFinalize
  },
  services: {
    startIntervalService
  }
};
