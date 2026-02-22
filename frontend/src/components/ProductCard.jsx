import React from "react";
import { useAuth } from "../Context/AuthContext";
import "../styles/Shop.css";

const ProductCard = ({ product }) => {
  const { user, addToCart, updateCartQuantity, cart, isAdmin } = useAuth();

  const cartItem = cart.find((item) => item._id === product._id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleQuantityChange = (delta) => {
    updateCartQuantity(product._id, delta);
  };

  return (
    <div className="product-card">
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

        {!isAdmin && (
          <div className="product-actions">
            {!cartItem ? (
              <button className="btn btn-primary" onClick={handleAddToCart}>
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
