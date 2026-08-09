import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage(): ReactElement {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(identifier, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.msg ?? "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Username or email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
          />

          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-gray-900 px-3 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-gray-900 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}