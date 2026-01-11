import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Login: React.FC = () => {
  const { signIn, authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for registeredSuccess flag in localStorage
    const registeredSuccess = localStorage.getItem("registeredSuccess");
    if (registeredSuccess) {
      toast.success("Account successfully created");
      localStorage.removeItem("registeredSuccess");
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (!result.success) return;

      alert(`Successfully logged in as ${email}`);
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 relative">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container mx-auto px-4 lg:px-8 max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2
          className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center"
          style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}
        >
          👋 Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-[#5a19ad]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-[#5a19ad]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {authError && <p className="text-red-500 text-sm">{authError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5a19ad] text-white py-3 rounded-lg hover:bg-[#A087C7]"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
