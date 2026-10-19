import { useEffect, useState } from 'react';

/**
 * The current time as React state, refreshed every `intervalMs`. Components use
 * this instead of calling Date.now() during render, so renders stay pure and
 * time-based values (due cards, streaks, "today") update in long sessions.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
