import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { orderApi } from "../services/api";
import toast from "react-hot-toast";
import "../styles/Cart.css";

const Cart = () => {
  const { cart, user, clearCart, updateCartQuantity, removeFromCart } =
    useAuth();
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.username || "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.1; 
  const deliveryFee = subtotal > 500 ? 0 : 50; 
  const total = subtotal + tax + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!shippingDetails.address || !shippingDetails.phone) {
      toast.error("Please fill in all shipping details");
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        userId: user.id,
        userName: shippingDetails.name,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        items: cart.map(({ _id, name, price, quantity }) => ({
          productId: _id,
          name,
          price,
          quantity,
        })),
        subtotal,
        tax,
        deliveryFee,
        total,
      };

      await orderApi.create(orderData);
      toast.success("Order placed successfully! 🎂");
      clearCart();
      navigate("/my-orders");
    } catch (error) {
      console.error("Order failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any treats yet!</p>
        <button className="btn btn-primary" onClick={() => navigate("/shop")}>
          Browse Cakes
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Sweet Cart</h1>

      <div className="cart-container">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />

              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-price">
                  <span>&#8377;</span>
                  {item.price.toFixed(2)}
                </p>
              </div>

              <div className="cart-item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => updateCartQuantity(item._id, -1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateCartQuantity(item._id, 1)}
                >
                  +
                </button>
              </div>

              <div className="cart-item-total">
                <span>&#8377;</span>
                {(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item._id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>
              <span>&#8377;</span>
              {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>
              <span>&#8377;</span>
              {tax.toFixed(2)}
            </span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee (Applicable for below 500)</span>
            <span>
              <span>&#8377;</span>
              {deliveryFee === 0 ? "Free" : `${deliveryFee.toFixed(2)}`}
            </span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>
              <span>&#8377;</span>
              {total.toFixed(2)}
            </span>
          </div>

          <div className="shipping-form">
            <h3>Shipping Details</h3>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={shippingDetails.name}
              onChange={handleInputChange}
              className="form-input"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={shippingDetails.phone}
              onChange={handleInputChange}
              className="form-input"
            />

            <textarea
              name="address"
              placeholder="Delivery Address"
              value={shippingDetails.address}
              onChange={handleInputChange}
              rows="3"
              className="form-input"
            />

            <button
              className="btn btn-primary btn-block"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>

          <p className="cart-quote">
            "A party without cake is just a meeting." — Julia Child
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
