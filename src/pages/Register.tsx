import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase.config";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const Register: React.FC = () => {
  const { signUp, authError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pwd: string): string => {
    if (pwd.length < 12) {
      return "Password must be at least 12 characters long.";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[0-9]/.test(pwd)) {
      return "Password must contain at least one number.";
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      return "Password must contain at least one symbol.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    } else {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    } else {
      setConfirmPasswordError("");
    }

    setLoading(true);

    try {
      // 1) Create Firebase Auth account (ONLY email + password)
      const userCredential = await signUp(email, password);
      if (!userCredential) return;
      const user = userCredential.user;

      // 2) Store the extra fields in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        address,
        course,
        role: "Buyer",
        createdAt: new Date(),
      });

      // 3) Save success flag & redirect to Login
      localStorage.setItem("registeredSuccess", "true");
      // Add short delay before navigating to ensure localStorage is set
      setTimeout(() => {
        navigate("/login");
      }, 100);
      
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-gray-50 to-white">
    <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
      <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2          className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center"
          style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}>
            Create Your Account
          </h2>
          <p className="text-gray-500 mt-2">
            Sign up to start buying and selling on <span className="font-semibold text-[#5a19ad]">re;love</span>.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
<label className="block text-sm font-medium text-gray-700 mb-1">
  Full Name <span className="text-red-500">*</span>
</label>
            <input
              type="text"
              placeholder="e.g. Alyana Ahmad"
              className="w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-[#5a19ad] focus:border-[#5a19ad] transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

        {/* Email */}
        <div>
<label className="block text-sm font-medium text-gray-700 mb-1">
  Student Email <span className="text-red-500">*</span>
</label>
          <input
            type="email"
            placeholder="e.g. aya123@student.usm.my"
            className="w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-[#5a19ad] focus:border-[#5a19ad] transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
           />
        </div>

        {/* Password */}
        <div>
<label className="block text-sm font-medium text-gray-700 mb-1">
  Password <span className="text-red-500">*</span>
</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 12 characters, 1 uppercase, 1 number, 1 symbol"
              minLength={12}
              className="w-full pr-12 px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-[#5a19ad] focus:border-[#5a19ad] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Confirm Password <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          minLength={6}
          className="w-full pr-12 px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-[#5a19ad] focus:border-[#5a19ad] transition"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {confirmPasswordError && (
        <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
      )}
    </div>

        {/* Phone */}
        <div>
<label className="block text-sm font-medium text-gray-700 mb-1">
  Phone Number <span className="text-red-500">*</span>
</label>
          <input
            type="tel"
            placeholder="e.g. 012-3456789"
            className="w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-[#5a19ad] focus:border-[#5a19ad] transition"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
           required
          />
        </div>

        {/* Address */}
        <div>
<label className="block text-sm font-medium text-gray-700 mb-1">
  Address in USM <span className="text-red-500">*</span>
</label>
          <textarea
            rows={3}
            placeholder="e.g. Kolej Kediaman, Universiti Sains Malaysia"
            className="w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-[#5a19ad] focus:border-[#5a19ad] transition"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Course */}
        <div>
<label className="block text-sm font-medium text-gray-700 mb-1">
  Course <span className="text-red-500">*</span>
</label>
          <input
            type="text"
            placeholder="e.g. Computer Science"
            className="w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:ring-[#5a19ad] focus:border-[#5a19ad] transition"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />
        </div>

          {/* Error */}
          {authError && (
            <p className="text-red-500 text-sm text-center">{authError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5a19ad] text-white py-3 rounded-xl shadow-md hover:bg-[#6E2CC8] transition font-semibold tracking-wide"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* Already have an account */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-[#5a19ad] font-medium hover:underline">
              Log in
            </Link>
          </p>

        </form>
      </div>
    </div>
  </div>
);

};

export default Register;
