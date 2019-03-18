import * as React from "react";
import { TCreateContext } from "use-machine";
import { ITimerContext, TTimerEvent, ITimerState } from "./machines/timer";

type TMachine = TCreateContext<ITimerContext, ITimerState, TTimerEvent>;
export const MachineContext = React.createContext<TMachine>({} as TMachine);
