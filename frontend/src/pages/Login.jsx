import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { authApi } from "../services/api";
import "../styles/Forms.css";
import login_bg from "../assets/login_bg.jpg";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const EyeOpen = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
      />
    </svg>
  );

  const EyeClosed = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "UserName is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      const response = await authApi.login(formData);
      login(response.data);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setErrors({
        form: error.response?.data?.message || "Invalid username or password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-container"
      style={{ backgroundImage: `url(${login_bg})` }}
    >
      <div className="auth-card">
        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">Login to satisfy your sweet cravings</p>
        {errors.form && <div className="error-message">{errors.form}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              UserName<span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className={errors.username ? "error" : ""}
              disabled={loading}
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Password<span className="required">*</span>
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? "error" : ""}
                disabled={loading}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </span>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block1"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
