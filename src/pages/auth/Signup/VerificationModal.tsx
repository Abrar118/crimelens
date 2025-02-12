import React, { useState } from "react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const styles: Record<string, React.CSSProperties> = {
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1c3d73",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.3s ease, background-color 0.3s ease",
  },
};
const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/user/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Verification successful!");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage("❌ Invalid OTP, please try again.");
      }
    } catch (error) {
      setMessage("⚠️ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#131a30] p-6 rounded-lg shadow-lg max-w-md w-full text-white relative">
        <h2
          className="lg:text-3xl text-center mb-10 animate-fade-in font-bold"
          style={{ color: "#ffbf00", zIndex: 1 }}
        >
          Verify Your Email
        </h2>
        <input
          type="email"
          className="w-full p-3 border border-gray-500 rounded-md bg-black text-white mb-3"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          className="w-full p-3 border border-gray-500 rounded-md bg-black text-white text-center text-lg tracking-widest"
          placeholder="Enter OTP"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        {message && <p className="text-center mt-2">{message}</p>}

        <div className="flex justify-center mt-4">
          <button
            style={styles.button}
            className="px-5 py-2 bg-[#1c3d73] text-black font-bold rounded-md mr-2 transition-transform hover:scale-105 disabled:bg-gray-600"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6 || !email}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            className="px-5 py-2 bg-gray-700 rounded-md text-white"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
