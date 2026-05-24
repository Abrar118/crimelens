"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";

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

  const handleSubmit = async () => {
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
      await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      await apiClient.post("/users/me", {
        name: formData.name,
        phone: formData.phone,
        profile_image: "",
      });

      toast.success("Account created! Please verify your phone number.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: "url(/images/signupbg.jpg)" }}
    >
      <div className="absolute inset-0 bg-[rgba(0,0,30,0.70)]" />

      <div className="shadow-2xl border-4 border-blue-300 rounded-2xl flex justify-center items-center z-10">
        <div className="lg:max-w-6xl md:max-w-4xl max-w-lg flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-[#131a30] shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <div
            className="hidden lg:flex flex-1 bg-cover bg-center w-[300px]"
            style={{
              backgroundImage: "url(/images/signupbg.jpg)",
              clipPath: "polygon(0 0, 95% 0, 65% 100%, 0% 100%)",
            }}
          />

          <div className="flex-1 p-[30px] flex flex-col justify-center text-[#f0f6ff]">
            <h2 className="lg:text-3xl text-center mb-10 font-bold text-[#ffbf00]">
              Register Your Account
            </h2>

            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />
            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />

            <div className="flex items-center mb-4">
              <input type="checkbox" id="terms" className="mr-2" checked={termsChecked} onChange={() => setTermsChecked(!termsChecked)} />
              <label htmlFor="terms" className="text-gray-300">
                By signing up, I agree with{" "}
                <span className="text-[#66fcf1] cursor-pointer">Terms & Conditions</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full p-3 rounded-md bg-[#1c3d73] text-white font-bold hover:bg-[#0e1b33] hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <span className="text-gray-300 mt-4">
              Already have an account?{" "}
              <Link href="/" className="text-[#66fcf1] cursor-pointer">
                Login here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
