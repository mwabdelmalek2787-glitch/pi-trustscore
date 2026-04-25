I’m currently in read-only Plan Mode, so I can’t edit `src/lib/pi.ts` or rebuild yet. Once approved, I will make the requested change and verify it.

Plan:

1. Update `src/lib/pi.ts`
   - Modify `isPiBrowser()` so it returns `true` immediately when `window.Pi` exists.
   - Expand the user-agent detection to include:
     - `PiBrowser`
     - `Pi Browser`
     - `PiNet`
     - `PiNetwork`
     - `minepi`
   - Keep the existing server-side guard for `typeof window === "undefined"`.

2. Rebuild and verify
   - Run the project build/type check.
   - Confirm there are no build errors.
   - Confirm the updated logic will make `Pi.init({ sandbox: false })` inside Pi Browser when either the Pi SDK global exists or the user agent contains the Pi Browser identifiers.

3. Report back
   - Provide the build result.
   - Paste the exact final contents of `src/lib/pi.ts` as requested.

Technical detail:

The key function will become equivalent to:

```ts
export const isPiBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  if (typeof window.Pi !== "undefined") return true;
  return /(PiBrowser|Pi Browser|PiNet|PiNetwork|minepi)/i.test(navigator.userAgent);
};
```