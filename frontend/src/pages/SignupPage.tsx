  import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.error?.issues?.[0]?.message ??
          err.response?.data?.msg ??
          "Something went wrong. Please try again.";

        setError(message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <main className="font-mono bg-[#fbf1c7] text-[#3c3836] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm grid-cols-1 gap-16 items-center">
        <section>

          <h1 className="text-5xl font-semibold">
            Create an account
          </h1>

          <form onSubmit={onSubmit} className="space-y-4 mt-12">
            <label htmlFor="username" className="sr-only"></label>
            <input
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={100}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full h-12 border border-[#d5c4a1] rounded-md px-4 py-2 focus:outline-none focus:border-[#b57614] bg-[#f2e5bc] text-[#3c3836] focus:ring-2"
            />

            <label htmlFor="email" className="sr-only"></label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-12 border border-[#d5c4a1] rounded-md px-4 py-2 focus:outline-none focus:border-[#b57614] bg-[#f2e5bc] text-[#3c3836] focus:ring-2"
            />

            <label htmlFor="password" className="sr-only"></label>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 border border-[#d5c4a1] rounded-md px-4 py-2 focus:outline-none focus:border-[#b57614] bg-[#f2e5bc] text-[#3c3836] focus:ring-2"
            />

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-md bg-[#3c3836] text-white text-sm px-3 py-2 hover:bg-[#504945] disabled:opacity-50"
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
        </section>


        <section>
          
        </section>
      </div>
    </main>
  );
}