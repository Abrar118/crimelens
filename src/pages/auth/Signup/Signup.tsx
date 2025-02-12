import type React from "react";
import { useState } from "react";
import bg from "../../../assets/signupbg.jpg";
import VerificationModal from "./VerificationModal";

import { toast } from "sonner";
import { createUser } from "@/apis/userApis";
import { sendEmail } from "@/lib/send-mail";
import { Link } from "react-router-dom";


const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 30, 0.70)",
  },
  cardContainer: {
    display: "flex",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
    backgroundColor: "#131a30",
  },
  bgImage: {
    flex: 1,
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    clipPath: "polygon(0 0, 95% 0, 65% 100%, 0% 100%)",
    width: 300,
  },
  formContainer: {
    flex: 1,
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "#f0f6ff",
  },
  inputField: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #4f576f",
    backgroundColor: "#1f2a40",
    color: "#f0f6ff",
    transition: "transform 0.2s ease, background-color 0.2s ease",
  },
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

type FormDataType = {
  name: string;
  email: string;
  phone: string;
  password: string;
  profile_image: string;
};

const Signup: React.FC = () => {
  // ✅ Properly typed useState
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    phone: "",
    password: "",
    profile_image: "",
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!termsChecked) {
      toast.error("Please agree to the terms and conditions to proceed.");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      toast.error("Please fill all the fields to proceed.");
      return;
    }

    try {
      setLoading(true);
      const response = await createUser(formData);

      if (response) {
        setIsModalOpen(true);
        const { message, OTP } = response;

        toast.success(message);
        sendEmail(
          "mistdecoders@gmail.com",
          formData.email,
          "OTP Verification",
          `Your OTP is: ${OTP}. This will exprire in 10 minutes.`
        );

        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          profile_image: "",
        });
        setTermsChecked(false);
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-flicker" style={styles.container}>
      <div style={styles.overlay} />

      <div className="shadow-2xl border-4 border-blue-300 rounded-2xl flex justify-center items-center">
        <div
          className="animate-fade-in-up lg:max-w-6xl md:max-w-4xl max-w-lg flex flex-col lg:flex-row"
          style={styles.cardContainer}
        >
          {/* Left Section with Background Image - Hidden on Mobile */}
          <div className="hidden lg:flex" style={styles.bgImage} />

          {/* Right Section with Form */}
          <div style={styles.formContainer}>
            <h2
              className="lg:text-3xl text-center mb-10 animate-fade-in font-bold"
              style={{ color: "#ffbf00", zIndex: 1 }}
            >
              Register Your Account
            </h2>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              style={styles.inputField}
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              style={styles.inputField}
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              style={styles.inputField}
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              style={styles.inputField}
              value={formData.password}
              onChange={handleChange}
            />
            <input
              type="text"
              name="profile_image"
              placeholder="Profile Image URL"
              style={styles.inputField}
              value={formData.profile_image}
              onChange={handleChange}
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="terms"
                className="mr-2"
                onClick={() => setTermsChecked(!termsChecked)}
              />
              <label htmlFor="terms" className="text-gray-300">
                By signing up, I agree with{" "}
                <span style={{ color: "#66fcf1", cursor: "pointer" }}>
                  Terms & Conditions
                </span>
              </label>
            </div>

            <button
              type="button"
              style={styles.button}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = "scale(1.05)";
                target.style.backgroundColor = "#0e1b33";
              }}
              onClick={() => handleSubmit()}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = "scale(1)";
                target.style.backgroundColor = "#1c3d73";
              }}
              onFocus={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = "scale(1.05)";
                target.style.backgroundColor = "#0e1b33";
              }}
              onBlur={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = "scale(1)";
                target.style.backgroundColor = "#1c3d73";
              }}
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>
            <span className="text-gray-300 mt-4">
              Already have an account?{" "}
              <Link
                to={"/login"}
                style={{ color: "#66fcf1", cursor: "pointer" }}
              >
                Login here
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* ✅ OTP Verification Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          @keyframes fade-in-up {
            0% { transform: translateY(20px); opacity: 0.8; }
            100% { transform: translateY(0); opacity: 1; }
          }
          @keyframes fade-in-out {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          .animate-flicker {
            animation: flicker 3s infinite ease-in-out;
          }
          .animate-fade-in-up {
            animation: fade-in-up 1.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Signup;
