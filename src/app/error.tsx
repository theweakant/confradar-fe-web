"use client";

import ErrorUI from "@/components/utility/Error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorUI error={error} reset={reset} />;
}
