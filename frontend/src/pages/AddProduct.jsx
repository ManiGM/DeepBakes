import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../services/api";
import toast from "react-hot-toast";
import "../styles/AddProduct.css";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "cake",
    inStock: true,
  });
  const { id } = useParams();
  const isEditMode = Boolean(id);
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

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const res = await productApi.getById(id);
          setFormData({
            name: res.data.name,
            price: res.data.price,
            description: res.data.description,
            image: res.data.image,
          });
          setImagePreview(res.data.image);
        } catch (error) {
          toast.error("Failed to load product");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const MAX_IMAGE_DIMENSION = 900;
  const IMAGE_QUALITY = 0.8;

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(
            1,
            MAX_IMAGE_DIMENSION / Math.max(img.width, img.height),
          );
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
      setFormData((prev) => ({
        ...prev,
        image: compressed,
      }));
    } catch {
      toast.error("Failed to process image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.price ||
      !formData.description ||
      (!formData.image && !isEditMode)
    ) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      if (id) {
        await productApi.update(id, {
          name: formData.name,
          price: Number(formData.price),
          description: formData.description,
          image: formData.image,
        });
        toast.success("Product updated successfully 🎂");
      } else {
        await productApi.create({
          name: formData.name,
          price: Number(formData.price),
          description: formData.description,
          image: formData.image,
        });
        toast.success("Product added successfully 🎂");
      }
      navigate("/shop");
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Adding your Delight to the Shop.....</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        {/* <h1>{id ? "Edit Delight" : "Add New Delight"}</h1> */}
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group2">
            <label htmlFor="name">
              Product Name <span className="required">*</span>
            </label>
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
            <div className="form-group2">
              <label htmlFor="price">
                Price <span className="required">*</span>
              </label>
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
            <div className="form-group2">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select1 custom-arrow"
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
          <div className="form-group2">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
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
          <div className="form-group2">
            <label htmlFor="image">
              Product Image {!isEditMode && <span className="required">*</span>}
            </label>
            <div className="image-upload-area2">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="file-input"
                required={!isEditMode}
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
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary1"
              onClick={() => navigate("/shop")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary1"
              disabled={loading}
            >
              {isEditMode ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
