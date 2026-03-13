import { useState, useEffect } from "react";
import { productApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import "../styles/Shop.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const getCategory = (name) => {
    const n = name.toLowerCase().trim();
    if (n.includes("cookie")) return "cookies";
    if (n.includes("cupcake") || n.includes("cake")) return "cupcakes";
    if (n.includes("brownie")) return "brownies";
    if (n.includes("doughnut")) return "doughnuts";
    if (n.includes("chocolate")) return "chocolates";
    if (n.includes("bomboloni")) return "bomboloni";
    if (n.includes("cracker")) return "crackers";
    if (n.includes("malai toast")) return "malaiToast";
    return "other";
  };

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((product) => getCategory(product.name) === filter);

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
        {/* <h1 style={{ color: "#4c1d3b" }}>Our Delights</h1> */}
        <div className="filters-bar">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-btn  ${filter === "cookies" ? "active" : ""}`}
            onClick={() => setFilter("cookies")}
          >
            Cookies
          </button>
          <button
            className={`filter-btn  ${filter === "cupcakes" ? "active" : ""}`}
            onClick={() => setFilter("cupcakes")}
          >
            Cup Cakes
          </button>
          <button
            className={`filter-btn  ${filter === "brownies" ? "active" : ""}`}
            onClick={() => setFilter("brownies")}
          >
            Brownies
          </button>
          <button
            className={`filter-btn  ${filter === "doughnuts" ? "active" : ""}`}
            onClick={() => setFilter("doughnuts")}
          >
            Doughnuts
          </button>
          <button
            className={`filter-btn  ${filter === "chocolates" ? "active" : ""}`}
            onClick={() => setFilter("chocolates")}
          >
            Chocolates
          </button>
          <button
            className={`filter-btn  ${filter === "bomboloni" ? "active" : ""}`}
            onClick={() => setFilter("bomboloni")}
          >
            Bomboloni
          </button>
          <button
            className={`filter-btn  ${filter === "crackers" ? "active" : ""}`}
            onClick={() => setFilter("crackers")}
          >
            Crackers
          </button>
          <button
            className={`filter-btn  ${filter === "malaiToast" ? "active" : ""}`}
            onClick={() => setFilter("malaiToast")}
          >
            Malai Toast
          </button>
        </div>
      </div>
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No Products Found Matching Your Search...</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDeleteSuccess={(id) =>
                setProducts((prev) => prev.filter((p) => p._id !== id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
