import { useAuth } from "../Context/AuthContext";
import "../styles/Shop.css";
import { productApi } from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onDeleteSuccess }) => {
  const { addToCart, updateCartQuantity, cart, isAdmin } = useAuth();
  const cartItem = cart.find((item) => item._id === product._id);
  // const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleQuantityChange = (delta) => {
    updateCartQuantity(product._id, delta);
  };

  const onDelete = async (id) => {
    try {
      setDeleting(true);
      await productApi.delete(id);
      if (onDeleteSuccess) {
        onDeleteSuccess(id);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="product-card" style={{ position: "relative" }}>
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">
          <span>&#8377;</span>
          {Number(product.price || 0).toFixed(2)}
        </div>
        {isAdmin && (
          <>
            <button
              onClick={() => navigate(`/add-product/${product._id}`)}
              style={{
                position: "absolute",
                top: "8px",
                right: "35px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                padding: "4px",
                color: "#007bff",
              }}
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(product._id)}
              disabled={deleting}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "14px",
                color: "#540505",
                padding: "4px",
              }}
            >
              {deleting ? "Deleting..." : "❌"}
            </button>
          </>
        )}
        {!isAdmin && (
          <div className="product-actions">
            {!cartItem ? (
              <button className="btn btn-primary1" onClick={handleAddToCart}>
                Add to Cart
              </button>
            ) : (
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={cartItem.quantity <= 1}
                >
                  −
                </button>
                <span className="qty-display">{cartItem.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
