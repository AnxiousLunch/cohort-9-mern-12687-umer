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
    } 
    catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.msg || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    };
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#fbf1c7]">
      <div className="flex flex-col">
        <div>
          <h1 className="text-2xl font-semibold ">Welcome Back</h1>
          <div className="border-1 ">Keep thoughts that matter</div>
        </div>
        <div className="w-full max-w-sm">

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
      </div>
      <div className="flex-1 flex items-center justify-center">
        <NotePreviewComponent/>
      </div>
    </main>
  );
}


export function NotePreviewComponent() {
  return (
      <div className="bg-gray-50 w-80 h-80 rounded-xl border-1">
        
        <div className="bg-[#f2e5bc] w-full h-8 rounded-t-xl top-0 flex items-center px-1 py-2 justify-between">
          <div className="">Untitled</div>
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-[#b8bb26]" />
            <div className="w-3 h-3 rounded-full bg-[#fabd2f]" />
            <div className="w-3 h-3 rounded-full bg-[#fb4934]" />
          </div>
        </div>


        <div className="mt-4 px-4">
          <h1>Things to remember:</h1>
          <ul>
            <li>Buy eggs</li>
            <li>Fix the editor</li>
            <li>Decide name for project</li>
          </ul>
        </div>
      
      </div>
  );
}