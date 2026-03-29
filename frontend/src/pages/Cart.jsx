import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { orderApi, razorPayApi } from "../services/api";
import toast from "react-hot-toast";
import "../styles/Cart.css";

const Cart = () => {
  const { cart, user, clearCart, updateCartQuantity, removeFromCart } =
    useAuth();

  const [shippingDetails, setShippingDetails] = useState({
    name: user?.username || "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
      if (value.length === 1 && !/[6-9]/.test(value)) return;
    }

    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (
      !shippingDetails.address ||
      !shippingDetails.phone ||
      !shippingDetails.email
    ) {
      toast.error("Please Fill All Shipping Details");
      return;
    }
    try {
      setLoading(true);
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Razorpay SDK Failed To Load.");
        setLoading(false);
        return;
      }
      let data = {
        amount: total,
        userId: user.id,
        userName: shippingDetails.name,
        email: shippingDetails.email,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        items: cart.map(({ _id, name, price, quantity }) => ({
          productId: _id,
          name,
          price,
          quantity,
        })),
        total,
      };
      const order = await razorPayApi.create(data);
      const options = {
        key: "rzp_live_SQfpD89Jkdq4Bs",
        amount: order.amount,
        currency: "INR",
        name: "Deep Bakes",
        description: "Cake Order Payment",
        order_id: order.id,
        handler: async function () {
          toast.success("Payment Successful 🎉, Order Placed");
          clearCart();
          // setTimeout(() => {
          //   navigate("/my-orders");
          // }, 500);
          let attempts = 0;
          let found = false;
          while (attempts < 5 && !found) {
            try {
              const res = await orderApi.getByUser(user.id);
              if (res.data.length > 0) {
                found = true;
                break;
              }
            } catch (err) {}
            await new Promise((resolve) => setTimeout(resolve, 2000));
            attempts++;
          }
          navigate("/my-orders");
        },
        prefill: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        theme: {
          color: "#979ff9",
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment Cancelled");
            setLoading(false);
          },
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function () {
        toast.error("Payment Failed. Please try again.");
        setLoading(false);
      });
      paymentObject.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment initialization failed");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Processing Payment...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any treats yet!</p>
        <button className="btn btn-primary1" onClick={() => navigate("/shop")}>
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
                  {Number(item.price || 0).toFixed(2)}
                </p>
              </div>
              <div className="cart-item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => updateCartQuantity(item._id, -1)}
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
            <span>Tax (5%)</span>
            <span>
              <span>&#8377;</span>
              {tax.toFixed(2)}
            </span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee (Applicable for below 500)</span>
            <span>
              <span>&#8377;</span>
              {deliveryFee === 0 ? "Free" : deliveryFee.toFixed(2)}
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
              className="form-input1"
              readOnly
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={shippingDetails.email}
              onChange={handleInputChange}
              className="form-input1"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={shippingDetails.phone}
              onChange={handleInputChange}
              className="form-input1"
              maxLength={10}
            />
            <textarea
              name="address"
              placeholder="Delivery Address"
              value={shippingDetails.address}
              onChange={handleInputChange}
              rows="3"
              className="form-input1"
            />
            <button
              className="btn btn-primary1 btn-block"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay & Place Order"}
            </button>
          </div>
          <p className="cart-quote">
            A party without sweet is just a meeting — Deep Bakes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
