import { useAuth } from "../Context/AuthContext";
import "../styles/Shop.css";
import { productApi, API_BASE_URL } from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const ProductCard = ({ product, onDeleteSuccess }) => {
  const { addToCart, updateCartQuantity, cart, isAdmin } = useAuth();
  const cartItem = cart.find((item) => item._id === product._id);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const description = product.description || "";
  const isLong = description.length > 80;

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
    <div className="product-card">
      <div className="product-image">
        <img
          src={`${API_BASE_URL}/products/${product._id}/image`}
          alt={product.name}
          loading="lazy"
          decoding="async"
        />
        {isAdmin && (
          <div className="product-admin-actions">
            <button
              className="admin-icon-btn edit"
              onClick={() => navigate(`/add-product/${product._id}`)}
              title="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              className="admin-icon-btn delete"
              onClick={() => onDelete(product._id)}
              disabled={deleting}
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
      <div className="product-details">
        <h3 className="product-name">{product.name}</h3>
        <p className={`product-description ${expanded ? "expanded" : ""}`}>
          {description}
        </p>
        {isLong && (
          <button
            type="button"
            className="show-more-btn"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
        <div className="product-footer">
          <div className="product-price">
            <span>&#8377;</span>
            {Number(product.price || 0).toFixed(2)}
          </div>
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
    </div>
  );
};

export default ProductCard;
