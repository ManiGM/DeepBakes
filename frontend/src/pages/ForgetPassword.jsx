import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import toast from "react-hot-toast";
import "../styles/Forms.css";
import login_bg from "../assets/login_bg.jpg";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      let cleaned = value.replace(/\D/g, "");
      if (cleaned.length === 1 && !/^[6-9]$/.test(cleaned)) {
        cleaned = "";
      }
      cleaned = cleaned.slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePhone = () => {
    const newErrors = {};
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Enter valid 10-digit mobile number starting with 6, 7, 8 or 9";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Must contain uppercase, lowercase and number";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckPhone = async (e) => {
    e.preventDefault();
    if (!validatePhone()) return;
    try {
      setLoading(true);
      const res = await authApi.checkUser({
        phone: formData.phone,
      });
      if (res.data.exists) {
        toast.success("Phone Number Verified. Set New Password.");
        setStep(2);
      } else {
        toast.error("Phone Number Not Registered");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      setLoading(true);
      await authApi.resetPassword({
        phone: formData.phone,
        password: formData.password,
      });
      toast.success("Password Updated!");
      navigate("/login");
    } catch {
      toast.error("Password Update Failed");
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
        <h1>Reset Password</h1>
        {step === 1 && (
          <form onSubmit={handleCheckPhone} className="auth-form" noValidate>
            <div className="form-group ">
              <label style={{margin:"auto"}}>
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                className={errors.phone ? "error" : ""}
                disabled={loading}
                maxLength="10"
                style={{margin:"auto"}}
              />
              {errors.phone && (
                <span className="field-error">{errors.phone}</span>
              )}
            </div>
            <button
              type="submit"
              className=" btn-primary"
              style={{maxHeight:"50px",marginTop:"11%"}}
              disabled={loading}
            >
              {loading ? "Checking..." : "Verify Phone"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form
            onSubmit={handleUpdatePassword}
            className="auth-form1"
            noValidate
          >
            <div className="form-group">
              <label>
                New Password <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className={errors.password ? "error" : ""}
                  disabled={loading}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </span>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>
            <div className="form-group">
              <label>
                Confirm Password <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? "error" : ""}
                  disabled={loading}
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
                </span>
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block1"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
