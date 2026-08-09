  import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage(): ReactElement {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signup(username, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const zodIssue = err?.response?.data?.error?.issues?.[0]?.message;

      setError(
        zodIssue ??
          err?.response?.data?.msg ??
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">
          Create an account
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            autoComplete="username"
            required
            minLength={3}
            maxLength={100}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
          />

          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
          />

          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
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
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-gray-900 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}