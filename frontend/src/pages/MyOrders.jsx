import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { orderApi } from "../services/api";
import { Link } from "react-router-dom";
import "../styles/Myorders.css";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders();
    }
  }, [user?.id]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getByUser(user.id);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    return orders.filter(
      (order) => order.status.toLowerCase() === filter.toLowerCase(),
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Accepted":
        return "status-accepted";
      case "Delivered":
        return "status-delivered";
      case "Rejected":
        return "status-rejected";
      default:
        return "";
    }
  };

  const formatDate = (dateInput) => {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="my-orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
      </div>
      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">🍰</div>
          <h2>No orders yet</h2>
          <p>Looks like you haven't placed any orders with us yet.</p>
          <Link to="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="orders-container">
            {filteredOrders.length === 0 ? (
              <div className="no-filtered-orders">
                <p>No {filter} orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order._id.slice(-8)}</h3>
                      <span
                        className={`order-status ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="order-date">
                      Ordered On - {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="order-body">
                    <div className="order-items">
                      <h4>Items</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">
                            x{item.quantity}
                          </span>
                          <span className="item-price">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="order-summary">
                      {(() => {
                        const subtotal =
                          order.subtotal ??
                          order.items.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0,
                          );
                        const tax = order.tax ?? subtotal * 0.05;
                        const deliveryFee =
                          order.deliveryFee ?? (subtotal > 500 ? 0 : 50);
                        return (
                          <>
                            <div className="summary-row">
                              <span>Subtotal:</span>
                              <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                              <span>Tax (5%):</span>
                              <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                              <span>Delivery:</span>
                              <span>
                                {deliveryFee === 0
                                  ? "Free"
                                  : `₹${deliveryFee.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="summary-row total">
                              <span>Total:</span>
                              <span>₹{order.total?.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="order-footer">
                    <div className="delivery-details">
                      <p>
                        <strong>Delivery Address:</strong> {order.address}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.phone}
                      </p>
                    </div>
                    {order.status === "Pending" && (
                      <div className="order-message">
                        ⏳ Your order is being reviewed by our bakery team
                      </div>
                    )}
                    {order.status === "Accepted" && (
                      <div className="order-message accepted">
                        🎂 Great news! Your order has been accepted and is being
                        prepared
                      </div>
                    )}
                    {order.status === "Delivered" && (
                      <div className="order-message delivered">
                        ✅ Order delivered! Thank you for choosing Deep Bakes
                      </div>
                    )}
                    {order.status === "Rejected" && (
                      <div className="order-message rejected">
                        ❌ Sorry, we couldn't fulfill this order. Please contact
                        us for more details
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyOrders;
