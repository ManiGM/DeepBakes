import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import toast from "react-hot-toast";
import "../styles/Forms.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
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
      {/* Eye shape */}
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a21.77 21.77 0 0 1 5.06-6.94" />
      <path d="M1 1l22 22" />
      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
      <path d="M14.12 14.12L9.88 9.88" />
    </svg>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Remove non-digits
      let cleanedValue = value.replace(/\D/g, "");

      // If first digit exists and is not 6-9 → remove it
      if (cleanedValue.length === 1 && !/^[6-9]$/.test(cleanedValue)) {
        cleanedValue = "";
      }

      // If more than 1 digit and first digit invalid → fix it
      if (cleanedValue.length > 1 && !/^[6-9]/.test(cleanedValue)) {
        cleanedValue = cleanedValue.slice(1);
      }

      // Limit to 10 digits
      const truncatedValue = cleanedValue.slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        [name]: truncatedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle phone input blur for additional validation
  const handlePhoneBlur = () => {
    if (formData.phone && formData.phone.length < 10) {
      setErrors((prev) => ({
        ...prev,
        phone: "Phone number must be exactly 10 digits",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // UserName validation
    if (!formData.username.trim()) {
      newErrors.username = "UserName is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "UserName must be at least 3 characters";
    } else if (formData.username.length > 30) {
      newErrors.username = "UserName cannot exceed 30 characters";
    }

    // Phone validation - strict 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits (numbers only)";
    } else {
      // Additional check to ensure it's a valid Indian phone number format (optional)
      const firstDigit = formData.phone.charAt(0);
      if (firstDigit === "0") {
        newErrors.phone = "Phone number cannot start with 0";
      } else if (firstDigit === "1") {
        newErrors.phone = "Phone number cannot start with 1";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 20) {
      newErrors.password = "Password cannot exceed 20 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
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
      const { confirmPassword, ...userData } = formData;

      // Ensure phone is stored as string of digits
      userData.phone = formData.phone;

      const response = await authApi.register(userData);

      if (response.data?.success) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      } else {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format phone number for display (optional)
  const formatPhoneDisplay = (phone) => {
    if (!phone) return "";
    // Format as XXX-XXX-XXXX for better readability
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Join Deep Bakes</h1>
        {/* <p className="auth-subtitle">Create your account to start ordering</p> */}

        {errors.form && (
          <div className="error-message" role="alert">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">
              UserName <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={errors.username ? "error" : ""}
              disabled={loading}
              autoComplete="username"
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username && (
              <span id="username-error" className="field-error" role="alert">
                {errors.username}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              placeholder="Enter 10-digit mobile number"
              className={errors.phone ? "error" : ""}
              disabled={loading}
              autoComplete="tel"
              maxLength="10"
              inputMode="numeric"
              pattern="[0-9]{10}"
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            />
            {formData.phone && formData.phone.length === 10 && (
              <span className="phone-format-hint">
                {formatPhoneDisplay(formData.phone)}
              </span>
            )}

            {errors.phone && (
              <span id="phone-error" className="field-error" role="alert">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password <span className="required">*</span>
            </label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={errors.password ? "error" : ""}
                disabled={loading}
                autoComplete="new-password"
              />

              <span
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeClosed /> : <EyeOpen />}
              </span>
            </div>

            {errors.password && (
              <span className="field-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </label>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "error" : ""}
                disabled={loading}
                autoComplete="new-password"
              />

              <span
                className="eye-icon"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
              </span>
            </div>

            {errors.confirmPassword && (
              <span className="field-error" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Creating Account...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
