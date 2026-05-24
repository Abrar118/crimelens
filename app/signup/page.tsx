"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";
import { Shield, Loader2, Mail, Lock, User, Phone, ArrowRight, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsChecked) {
      toast.error("Please agree to the terms and conditions to proceed.");
      return;
    }
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill all the fields to proceed.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const idToken = await userCredential.user.getIdToken();
      const sessionRes = await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.json().catch(() => ({}));
        console.error("Session creation failed:", err);
      }

      await apiClient.post("/users/me", {
        name: formData.name,
        phone: formData.phone,
        profile_image: "",
      });

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const message = error instanceof Error ? error.message : "Signup failed";
      if ((error as any)?.response?.data?.error) {
        toast.error((error as any).response.data.error);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url(/images/signupbg.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e]/90 via-[#0a0f1e]/80 to-[#0a0f1e]/90" />

      <div className="relative z-10 w-full max-w-5xl mx-4 grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-sm">
        {/* Left — Hero image panel */}
        <div
          className="hidden lg:flex flex-col justify-end p-10 bg-cover bg-center relative min-h-[640px]"
          style={{ backgroundImage: "url(/images/signupbg.jpg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-400" size={28} />
              <span className="text-2xl font-bold text-white tracking-tight">CrimeLens</span>
            </div>
            <p className="text-gray-300 text-sm max-w-xs leading-relaxed">
              Join the community and help make your neighborhood safer.
            </p>
            <div className="space-y-2 pt-2">
              {["Report crimes with evidence", "Verify community reports", "Access emergency contacts"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Signup form */}
        <div className="bg-[#0f1629]/95 p-8 md:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="text-blue-400" size={24} />
            <span className="text-xl font-bold text-white tracking-tight">CrimeLens</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm mb-8">Get started in under a minute</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-sm font-medium text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-300">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+880 1700 000000"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={() => setTermsChecked(!termsChecked)}
                className="mt-0.5 rounded border-gray-600 bg-white/5 text-blue-500 focus:ring-blue-500/50"
              />
              <span className="text-sm text-gray-400 leading-snug">
                I agree to the{" "}
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Privacy Policy</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{" "}
            <Link href="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
