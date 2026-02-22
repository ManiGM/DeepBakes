import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "../styles/Navbar.css";
import  logo  from "../assets/logo.jpg"

const Navbar = () => {
  const { user, cart, logout, isAdmin, isAuthenticated } = useAuth();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          <img src={logo} style={{width:"90px",height:"70px",borderRadius:"12px"}} />
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/shop" className="nav-link">
          Shop
        </Link>
        {isAdmin && (
          <>
            <Link to="/add-product" className="nav-link">
              Add Product
            </Link>
            <Link to="/admin-orders" className="nav-link">
              Manage Orders
            </Link>
          </>
        )}
        {isAuthenticated && !isAdmin && (
          <Link to="/my-orders" className="nav-link">
            My Orders
          </Link>
        )}
      </div>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            {!isAdmin && (
              <Link to="/cart" className="cart-link">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </Link>
            )}
            <div className="user-menu">
              <span className="username">Hi, {user.username}</span>
              <button onClick={logout} className="logout-btn" title="Logout">
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
    </nav>
  );
};

export default Navbar;
