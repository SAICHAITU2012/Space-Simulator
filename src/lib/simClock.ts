/** Simulation clock: days since J2000, driven by UI speed. */

export type SimClockState = {
  playing: boolean;
  /** Visual multiplier from the Universe speed chips. */
  speed: number;
  /** Extra days/second at 1× (Tycho-style time flow). */
  daysPerSecond: number;
  /** Accumulated days since J2000. */
  epochDays: number;
};

export const DEFAULT_SIM_CLOCK: SimClockState = {
  playing: true,
  speed: 1,
  daysPerSecond: 8,
  epochDays: 0,
};

export function stepSimClock(clock: SimClockState, deltaSeconds: number): number {
  if (!clock.playing) return clock.epochDays;
  return clock.epochDays + deltaSeconds * clock.daysPerSecond * clock.speed;
}

export function formatSimDate(epochDays: number): string {
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const ms = j2000 + epochDays * 86400000;
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
}
