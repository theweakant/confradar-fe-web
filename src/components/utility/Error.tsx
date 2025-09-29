"use client";

import { useEffect } from "react";

export default function ErrorUI({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-red-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-600">Something went wrong!</h2>
        <p className="mt-2 text-gray-700">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
