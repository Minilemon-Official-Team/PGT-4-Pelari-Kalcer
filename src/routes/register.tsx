import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerContract } from "@/contracts/auth.contract";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatus("");

    // Validate
    const result = registerContract.safeParse({ email, username, password });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[String(issue.path[0])] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    try {
      setStatus("Signing up...");
      setIsLoading(true);
      const response = await authClient.signUp.email({ email, password, name: username });
      if (response.error) {
        setStatus(response.error.message || "Sign up failed");
        setIsLoading(false);
      } else {
        setIsLoading(false);
        await navigate({ to: "/" });
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Sign up failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isLoading}
            />
            {errors.username && <p className="text-sm text-red-400 mt-1">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
          </div>

          {status && !status.startsWith("Signing") && (
            <p className="text-sm text-red-400 text-center">{status}</p>
          )}

          <Button type="submit" variant="primary" className="w-full">
            {status === "Signing up..." ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
