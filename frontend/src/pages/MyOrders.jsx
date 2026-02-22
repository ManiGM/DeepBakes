import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { orderApi } from "../services/api";
import { Link } from "react-router-dom";
import "../styles/Myorders.css";

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, delivered, rejected

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <p>Track and manage your bakery orders</p>
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
          {/* Filter buttons */}
          <div className="order-filters">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Orders ({orders.length})
            </button>
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({orders.filter((o) => o.status === "Pending").length})
            </button>
            <button
              className={`filter-btn ${filter === "accepted" ? "active" : ""}`}
              onClick={() => setFilter("accepted")}
            >
              Accepted ({orders.filter((o) => o.status === "Accepted").length})
            </button>
            <button
              className={`filter-btn ${filter === "delivered" ? "active" : ""}`}
              onClick={() => setFilter("delivered")}
            >
              Delivered ({orders.filter((o) => o.status === "Delivered").length}
              )
            </button>
            <button
              className={`filter-btn ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rejected ({orders.filter((o) => o.status === "Rejected").length})
            </button>
          </div>

          {/* Orders list */}
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
                      {formatDate(order.createdAt)}
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
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>${order.subtotal?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax (10%):</span>
                        <span>${order.tax?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="summary-row">
                        <span>Delivery:</span>
                        <span>
                          {order.deliveryFee === 0
                            ? "Free"
                            : `$${order.deliveryFee?.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>${order.total?.toFixed(2) || "0.00"}</span>
                      </div>
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
                        ✅ Order delivered! Thank you for choosing SweetJoy
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
