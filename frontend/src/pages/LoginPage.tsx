import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// export default function LoginPage(): ReactElement {
//   const { login, isLoading } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);

//   const from =
//     (location.state as { from?: string } | null)?.from ?? "/dashboard";

//   const onSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     try {
//       await login(identifier, password);
//       navigate(from, { replace: true });
//     } 
//     catch (err: any) {
//       if (axios.isAxiosError(err)) {
//         setError(err.response?.data?.msg || "Login failed");
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Something went wrong");
//       }
//     };
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center p-6">
//       <div className="w-full max-w-sm">
//         <h1 className="text-2xl font-semibold mb-6">Log in</h1>

//         <form onSubmit={onSubmit} className="space-y-4">
//           <input
//             type="text"
//             autoComplete="username"
//             required
//             value={identifier}
//             onChange={(e) => setIdentifier(e.target.value)}
//             placeholder="Username or email"
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
//           />

//           <input
//             type="password"
//             autoComplete="current-password"
//             required
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Password"
//             className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
//           />

//           {error && (
//             <p className="text-sm text-red-600">
//               {error}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full rounded bg-gray-900 px-3 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
//           >
//             {isLoading ? "Logging in…" : "Log in"}
//           </button>
//         </form>

//         <p className="mt-6 text-sm text-gray-600">
//           Don't have an account?{" "}
//           <Link
//             to="/signup"
//             className="text-gray-900 font-medium hover:underline"
//           >
//             Sign up
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }


export default function LoginScreen() {
  return (
      <div className="bg-white w-64 h-64 rounded-xl">
        
        <div className="bg-red-600 w-64 h-8 rounded-t-xl top-0 flex items-center px-1 py-2 justify-between">
          <div className="">Untitled</div>
          <div className="flex gap-3">
            <div className="w-4 h-4 bg-green-600 rounded-xl"></div>
            <div className="w-4 h-4 bg-green-600 rounded-xl"></div>
            <div className="w-4 h-4 bg-green-600 rounded-xl"></div>
          </div>
        </div>


        <div>
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