import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "../styles/Navbar.css";
import logo from "../assets/deepbakes.png";

const Navbar = () => {
  const { user, cart, logout, isAdmin, isAuthenticated } = useAuth();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen);
    return () => document.body.classList.remove("nav-open");
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <img src={logo} className="brand-logo" alt="Deep Bakes" />
        </Link>
      </div>

      <div className="mobile-top-actions">
        {isAuthenticated && !isAdmin && cartItemCount > 0 && (
          <Link to="/cart" className="mobile-cart-link" aria-label="Cart">
            <ShoppingCart size={21} />
            <span className="cart-badge">{cartItemCount}</span>
          </Link>
        )}
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`nav-collapse ${menuOpen ? "open" : ""}`}>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`nav-link ${isActive("/shop") ? "active" : ""}`}
          >
            Shop
          </Link>
          {isAdmin && (
            <>
              <Link
                to="/add-product"
                className={`nav-link ${isActive("/add-product") ? "active" : ""}`}
              >
                Add Delight
              </Link>
              <Link
                to="/admin-orders"
                className={`nav-link ${isActive("/admin-orders") ? "active" : ""}`}
              >
                Manage Orders
              </Link>
            </>
          )}
          {isAuthenticated && !isAdmin && (
            <Link
              to="/my-orders"
              className={`nav-link ${isActive("/my-orders") ? "active" : ""}`}
            >
              Orders
            </Link>
          )}
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <Link
                  to="/cart"
                  className={`cart-link ${isActive("/cart") ? "active" : ""}`}
                >
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </Link>
              )}
              <div className="user-menu">
                <span className="username">Hi, {user.username}</span>
                <button
                  onClick={logout}
                  className="logout-btn"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="login-link">
              <User size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
