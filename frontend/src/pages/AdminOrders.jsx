import { useState, useEffect } from "react";
import { orderApi } from "../services/api";
import toast from "react-hot-toast";
import "../styles/Admin.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    delivered: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "Pending").length,
      accepted: orders.filter((o) => o.status === "Accepted").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      revenue: orders
        .filter((o) => o.status === "Delivered")
        .reduce((sum, o) => sum + o.total, 0),
    };
    setStats(newStats);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await orderApi.updateStatus(orderId, newStatus);
      toast.success(`Order  ${newStatus}`);
      setLoading(false);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status");
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

  return (
    <div className="admin-orders-page">
      <div className="admin-header">
        <h1>Manage Orders</h1>
        <p>Track and update customer orders</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card accepted">
          <span className="stat-label">Accepted</span>
          <span className="stat-value">{stats.accepted}</span>
        </div>
        <div className="stat-card delivered">
          <span className="stat-label">Delivered</span>
          <span className="stat-value">{stats.delivered}</span>
        </div>
        <div className="stat-card revenue">
          <span className="stat-label">Revenue</span>
          <span className="stat-value"> ₹{stats.revenue.toFixed(2)}</span>
        </div>
      </div>
      <div className="filters-bar">
        <button
          className={`filter-btn  ₹{filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Orders
        </button>
        <button
          className={`filter-btn  ₹{filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`filter-btn  ₹{filter === "accepted" ? "active" : ""}`}
          onClick={() => setFilter("accepted")}
        >
          Accepted
        </button>
        <button
          className={`filter-btn  ₹{filter === "delivered" ? "active" : ""}`}
          onClick={() => setFilter("delivered")}
        >
          Delivered
        </button>
        <button
          className={`filter-btn  ₹{filter === "rejected" ? "active" : ""}`}
          onClick={() => setFilter("rejected")}
        >
          Rejected
        </button>
      </div>
      <div className="orders-container">
        {getFilteredOrders().length === 0 ? (
          <div className="no-orders">
            <p>No orders found</p>
          </div>
        ) : (
          getFilteredOrders().map((order) => (
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
              <div className="order-details">
                <div className="customer-info">
                  <h4>Customer Details</h4>
                  <p>
                    <strong>Name:</strong> {order.userName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.address}
                  </p>
                </div>
                <div className="order-items">
                  <h4>Order Items</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                      <span> ₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  {(() => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const subtotal = items.reduce((sum, item) => {
                      const price = Number(item.price) || 0;
                      const qty = Number(item.qty ?? item.quantity) || 0;
                      return sum + price * qty;
                    }, 0);
                    const tax = subtotal * 0.05;
                    const deliveryFee = subtotal > 500 ? 0 : 50;
                    return (
                      <>
                        <div className="total-row">
                          <span>Subtotal:</span>
                          <span> ₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                          <span>Tax (5%):</span>
                          <span> ₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                          <span>Delivery:</span>
                          <span>
                            {deliveryFee === 0
                              ? "Free"
                              : `₹${deliveryFee.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="total-row grand-total">
                          <span>Total:</span>
                          <span> ₹{Number(order.total || 0).toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="order-actions">
                {order.status === "Pending" && (
                  <>
                    <button
                      className="btn btn-accept"
                      onClick={() => handleStatusUpdate(order._id, "Accepted")}
                    >
                      Accept Order
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleStatusUpdate(order._id, "Rejected")}
                    >
                      Reject Order
                    </button>
                  </>
                )}
                {order.status === "Accepted" && (
                  <button
                    className="btn btn-deliver"
                    onClick={() => handleStatusUpdate(order._id, "Delivered")}
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
