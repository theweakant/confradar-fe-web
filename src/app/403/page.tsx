"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ForbiddenPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/auth/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-600">403 - Forbidden</h1>
      <p className="mt-3 text-gray-600">
        You do not have permission to access this page.
      </p>

      <p className="mt-4 text-gray-500 text-sm">
        Redirecting to login in{" "}
        <span className="font-semibold">{countdown}</span> seconds...
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push("/auth/login")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
