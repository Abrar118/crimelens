"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const setUser = useAuthStore((state) => state.setUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      setUser(userCredential.user);
      const idToken = await userCredential.user.getIdToken();
      await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      toast.success("Login Successful");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent. Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(message);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: "url(/images/loginbg.jpg)" }}
    >
      <div className="absolute inset-0 bg-[rgba(0,0,30,0.70)]" />

      <div className="shadow-2xl border-4 rounded-2xl border-blue-300 flex justify-center items-center z-10">
        <div className="lg:max-w-6xl md:max-w-2xl max-w-lg flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#131a30] shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <div
            className="hidden lg:flex flex-1 bg-cover bg-center w-[300px]"
            style={{
              backgroundImage: "url(/images/loginbg.jpg)",
              clipPath: "polygon(0 0, 95% 0, 65% 100%, 0% 100%)",
            }}
          />

          <div className="flex-1 p-[30px] flex flex-col justify-center text-[#f0f6ff]">
            <h2 className="lg:text-3xl text-center mb-10 font-bold text-[#ffbf00]">
              Login to Your Account
            </h2>

            <div className="text-5xl flex justify-center mb-5 text-[#66fcf1]">
              🔒
            </div>

            <input
              type="text"
              name="email"
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff] focus:bg-[#0f0f0f] transition-all"
            />
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff] focus:bg-[#0f0f0f] transition-all"
            />

            <div className="flex items-center mb-4">
              <input type="checkbox" id="rememberMe" className="mr-2" />
              <label htmlFor="rememberMe" className="text-gray-300">
                Remember Me
              </label>
            </div>

            {showForgotPassword ? (
              <div className="mb-4 space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email for reset"
                  className="w-full p-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff] focus:bg-[#0f0f0f] transition-all"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="flex-1 p-2 rounded-md bg-[#66fcf1] text-[#131a30] font-bold hover:opacity-90 transition-all"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="p-2 rounded-md border border-[#4f576f] text-gray-300 hover:bg-[#1f2a40] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#66fcf1] text-sm mb-4 hover:underline text-left"
              >
                Forgot Password?
              </button>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full p-3 rounded-md bg-[#1c3d73] text-white font-bold hover:bg-[#0e1b33] hover:scale-105 transition-all"
              >
                Signup
              </button>
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full p-3 rounded-md bg-[#1c3d73] text-white font-bold hover:bg-[#0e1b33] hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
