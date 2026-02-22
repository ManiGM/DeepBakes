import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome back, ${userData.username}!`);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCart([]);
    toast.success("Logged out successfully");
  };

  const addToCart = (product) => {
    if (!user) {
      toast.error("Please login first");
      return false;
    }
    setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    toast.success("Added to cart!");
    return true;
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
    toast.success("Removed from cart");
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    user,
    cart,
    loading,
    login,
    logout,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};