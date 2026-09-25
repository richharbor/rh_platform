import type { EventName } from "./events";

export type { EventName };

type Sink = (event: EventName, props: Record<string, unknown>) => void;

let sink: Sink = (event, props) => {
  if (__DEV__) console.log("[analytics]", event, props);
};

/** Point this at the real analytics provider once one is chosen. */
export const setAnalyticsSink = (s: Sink) => {
  sink = s;
};

export const track = (event: EventName, props: Record<string, unknown> = {}) => sink(event, props);
