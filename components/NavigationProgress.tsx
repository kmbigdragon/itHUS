"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <ProgressBar
      height="3px"
      color="var(--color-accent)"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
