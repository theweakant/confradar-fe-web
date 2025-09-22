"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") router.push("/dashboard/admin");
    if (role === "user") router.push("/dashboard/user");
    if (role === "reviewer") router.push("/dashboard/reviewer");
    if (role === "organizer") router.push("/dashboard/organizer");
    if (role === "guest") router.push("/guest");
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded"
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">Select Role</option>
        <option value="guest">Guest</option>
        <option value="user">User</option>
        <option value="reviewer">Reviewer</option>
        <option value="admin">Admin</option>
        <option value="organizer">Organizer</option>
      </select>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Login
      </button>
    </form>
  );
}
