// Color theme obtained from
// https://github.com/morhetz/gruvbox#palette

/*
Background       #fbf1c7
Surface          #f2e5bc
Primary text     #3c836
Muted text       #7c6f64

Yellow           #b57614
Orange           #af3a03
Green            #79740e
Aqua             #427b58
Blue             #076678
Red              #9d0006
Purple           #8f3f71
*/

import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#fbf1c7]">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 itmes-center">

          {/* left */}
        <section className="w-full max-w-md mx-auto">
          <div className="mb-12">
            <p className="text-xs mb-4 text-[#7c6f64]">TASKIT</p>
            <h1 className="text-5xl font-semibold">Welcome back.</h1>

            <p className="mt-4 ">Keep thoughts that actually matter</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or email"
              className="w-full h-12 border border-[#d5c4a1] rounded-md px-4 py-2 focus:outline-none focus:border-[#b57614] bg-[#f2e5bc] text-[#3c3836] focus:ring-2"
            />

            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 border border-[#d5c4a1] rounded-md px-4 py-2 focus:outline-none focus:border-[#b57614] bg-[#f2e5bc] text-[#3c3836] focus:ring-2"
            />

            {error && <p className="text-sm text-[#9d0006]">{error}</p>}

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
        </section>

          {/* right */}

        <section className="flex-1 flex items-center justify-center">
          <NotePreviewComponent />
        </section>
      </div>
    </main>
  );
}

export function NotePreviewComponent() {
  return (
    <div className="relative w-80 min-h-80 bg-[#f2e5bc] border border-[#d5c4a1] rounded-lg -rotate-2 shadow-[10px_10px_0px_#d5c4a1]">
      <div className="bg-[#3c3836] text-[#fbf1c7] w-full h-8 rounded-t-xl top-0 flex items-center px-4 py-2 justify-between">
        <div className="text-md tracking-wide">Untitled</div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#b8bb26]" />
          <div className="w-3 h-3 rounded-full bg-[#fabd2f]" />
          <div className="w-3 h-3 rounded-full bg-[#fb4934]" />
        </div>
      </div>

      <div className="mt-4 px-8 py-8">
        <h1>Things to remember:</h1>
        <ul>
          <li className="flex items-start gap-3">
            <span className="text-[#79740e] gap-3">✓</span>
            <span>Buy eggs</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#79740e] gap-3">○</span>
            <span>Fix the editor</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#79740e] gap-3">○</span>
            <span>Think name for the project</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
