import { useState, useEffect } from "react";
import { productApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import "../styles/Shop.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

    if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading delicious treats...</p>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div
        className="shop-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h1 style={{ color: "#4c1d3b" }}>Our Collection</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search cakes, pastries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found matching your search.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
