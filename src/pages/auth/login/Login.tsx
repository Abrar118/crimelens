import type React from "react";
import bg from "../../../assets/loginbg.jpg";
import { useNavigate } from "react-router-dom";

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
  lock: {
    fontSize: "3rem",
    marginBottom: "20px",
    color: "#66fcf1",
    animation: "spin 5s linear infinite",
    display: "flex",
    justifyContent: "center",
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="animate-flicker" style={styles.container}>
      <div style={styles.overlay} />

      {/* Animated Random Lines */}
      {[...Array(15)].map((_, i) => (
        <div
          key={_ + i}
          className={`line-${i}`}
          style={{
            position: "absolute",
            top: 0,
            left: `${i * 6}%`,
            width: "2px",
            height: "100%",
            backgroundColor: "#1c6f6a",
            opacity: 0.3,
            animation: "fade-in-out 3s ease-in-out infinite",
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Login Card */}
      <div className="shadow-2xl border-4 rounded-2xl border-blue-300 flex justify-center items-center">
        <div
          className="animate-fade-in-up lg:max-w-6xl md:max-w-2xl max-w-lg flex flex-col md:flex-row"
          style={styles.cardContainer}
        >
          {/* Left Section with Background Image (Hidden on Small & Medium Screens) */}
          <div className="hidden lg:flex" style={styles.bgImage} />

          {/* Right Section with Form */}
          <div style={styles.formContainer}>
            <h2
              className="lg:text-3xl text-center mb-10 animate-fade-in font-bold"
              style={{ color: "#ffbf00", zIndex: 1 }}
            >
              Login to Your Account
            </h2>

            {/* Spinning Lock Icon */}
            <div style={styles.lock}>🔒</div>

            {/* Input Fields */}
            <input
              type="text"
              placeholder="Username"
              style={styles.inputField}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = "#0f0f0f";
                target.style.transform = "scale(1.02)";
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = "#1f2833";
                target.style.transform = "scale(1)";
              }}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.inputField}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = "#0f0f0f";
                target.style.transform = "scale(1.02)";
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = "#1f2833";
                target.style.transform = "scale(1)";
              }}
            />

            {/* Checkbox */}
            <div className="flex items-center mb-4">
              <input type="checkbox" id="rememberMe" className="mr-2" />
              <label htmlFor="rememberMe" className="text-gray-300">
                Remember Me
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                style={styles.button}
                onClick={() => navigate("/signup")}
                onMouseOver={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = "scale(1.05)";
                  target.style.backgroundColor = "#0e1b33";
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
                onMouseOut={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = "scale(1)";
                  target.style.backgroundColor = "#1c3d73";
                }}
              >
                Signup
              </button>
              <button
                type="button"
                style={styles.button}
                onMouseOver={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = "scale(1.05)";
                  target.style.backgroundColor = "#0e1b33";
                }}
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
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }

          @keyframes fade-in-up {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }

          .animate-fade-in-up {
            animation: fade-in-up 1.5s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
