import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../services/api";
import toast from "react-hot-toast";
import "../styles/Forms.css";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    category: "cake", // default category
    inStock: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.price ||
      !formData.description ||
      !formData.image
    ) {
      toast.error("Please fill in all fields and upload an image");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("price", formData.price);
      productData.append("description", formData.description);
      productData.append("category", formData.category);
      productData.append("inStock", formData.inStock);
      productData.append("image", formData.image);

      await productApi.create(productData);

      toast.success("Product added successfully! 🎂");
      navigate("/shop");
    } catch (error) {
      console.error("Failed to add product:", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1>Add New Delight</h1>
        <p className="admin-subtitle">Create a new product for your bakery</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Chocolate Fudge Cake"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="29.99"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="cake">Cakes</option>
                <option value="pastry">Pastries</option>
                <option value="cookie">Cookies</option>
                <option value="cupcake">Cupcakes</option>
                <option value="bread">Bread</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your delicious creation..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image *</label>
            <div className="image-upload-area">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="file-input"
                required
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <small className="form-hint">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
              />
              <span>In Stock</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/shop")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
