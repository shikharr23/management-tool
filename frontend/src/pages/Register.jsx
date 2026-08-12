import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.register(name, email, password);
      await login(response.accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f5f5f5] p-4">
      <div className="bg-white py-[50px] px-10 rounded-lg shadow-xs w-full max-w-[420px] border border-gray-100">
        <h1 className="mb-2 text-center text-[28px] font-bold text-gray-900">Create Account</h1>
        <p className="text-center text-gray-400 text-sm mb-[30px]">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
            />
          </div>
          {error && <p className="text-red-500 text-[13px] text-center bg-red-100 p-2.5 rounded">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 px-5 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 hover:-translate-y-px hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
