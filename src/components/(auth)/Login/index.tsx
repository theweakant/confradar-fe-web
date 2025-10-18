"use client";

import { LoginHero } from "./LoginHero";
import { LoginForm } from "./LoginForm";

export function Login() {
  return (
    <div className="flex h-screen w-full">
      <LoginHero />
      <LoginForm />
    </div>
  );
}