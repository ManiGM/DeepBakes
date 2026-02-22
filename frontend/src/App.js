import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ShoppingCart, User as UserIcon, LogOut, } from "lucide-react";

const API = "http://localhost:2213";

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [cart, setCart] = useState([]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <Router>
      <Toaster position="top-center" />
      <nav className="navbar">
        <Link to="/">
          <h2>🍰 SweetJoy</h2>
        </Link>
        <Link to="/shop">Shop</Link>
        {user?.role === "admin" && <Link to="/add-product">Add Product</Link>}
        {user?.role === "admin" && (
          <Link to="/admin-orders">Manage Orders</Link>
        )}
        {user && user.role !== "admin" && (
          <Link to="/my-orders">My Orders</Link>
        )}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {user ? (
            <>
              {user.role !== "admin" && (
                <Link to="/cart">
                  <ShoppingCart /> ({cart.length})
                </Link>
              )}
              <span>Hi, {user.username}</span>
              <LogOut onClick={logout} style={{ cursor: "pointer" }} />
            </>
          ) : (
            <Link to="/login">
              <UserIcon />
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/shop"
          element={<Shop user={user} cart={cart} setCart={setCart} />}
        />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/cart"
          element={<Cart cart={cart} setCart={setCart} user={user} />}
        />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/admin-orders" element={<AdminOrders />} />
        <Route path="/my-orders" element={<MyOrders user={user} />} />
      </Routes>
    </Router>
  );
}

// --- COMPONENTS ---

const Home = () => (
  <div className="hero">
    <h1>Artisanal Bakes for Every Occasion</h1>
    <Link
      to="/shop"
      className="btn"
      style={{ marginTop: "20px", textDecoration: "none" }}
    >
      Shop Now
    </Link>
  </div>
);

const Shop = ({ user, cart, setCart }) => {
  const [prods, setProds] = useState([]);
  useEffect(() => {
    axios.get(`${API}/products`).then((res) => setProds(res.data));
  }, []);

  const addToCart = (p) => {
    if (!user) return toast.error("Please login first");
    setCart([...cart, { ...p, qty: 1 }]);
    toast.success("Added to cart!");
  };

  const updateQty = (id, delta) => {
    setCart(
      cart.map((i) =>
        i._id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  };

  return (
    <div className="product-grid">
      {prods.map((p) => {
        const inCart = cart.find((item) => item._id === p._id);
        return (
          <div className="card" key={p._id}>
            <img src={p.image} alt="" />
            <div style={{ padding: "15px" }}>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <h4>${p.price}</h4>
              {user?.role !== "admin" &&
                (!inCart ? (
                  <button className="btn" onClick={() => addToCart(p)}>
                    Add to Cart
                  </button>
                ) : (
                  <div>
                    <button onClick={() => updateQty(p._id, -1)}>-</button>
                    <span style={{ margin: "0 10px" }}>{inCart.qty}</span>
                    <button onClick={() => updateQty(p._id, 1)}>+</button>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Login = ({ setUser }) => {
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/login`, form);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      toast.success("Welcome back!");
      navigate("/");
    } catch {
      toast.error("Wrong credentials");
    }
  };
  return (
    <div className="admin-form">
      <h2>Login</h2>
      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="btn" onClick={handleLogin}>
        Login
      </button>
      <Link to="/register">Don't have an account? Register</Link>
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const handleReg = async () => {
    await axios.post(`${API}/register`, form);
    toast.success("Registered! Please login.");
    navigate("/login");
  };
  return (
    <div className="admin-form">
      <h2>Register</h2>
      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="btn" onClick={handleReg}>
        Register
      </button>
    </div>
  );
};

const Cart = ({ cart, user, setCart }) => {
  const [details, setDetails] = useState({ name: "", phone: "", address: "" });
  const total = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const navigate = useNavigate();

  const placeOrder = async () => {
    const orderData = {
      userId: user.id,
      userName: details.name,
      phone: details.phone,
      address: details.address,
      items: cart,
      total: total,
    };
    await axios.post(`${API}/orders`, orderData);
    toast.success("Baked with love! Order Placed.");
    setCart([]);
    navigate("/my-orders");
  };

  return (
    <div style={{ padding: "100px 10%" }}>
      <h2>Your Cart (${total})</h2>
      {cart.map((i) => (
        <div key={i._id}>
          {i.name} x {i.qty}
        </div>
      ))}
      <hr />
      <h3>Shipping Details</h3>
      <input
        placeholder="Name"
        onChange={(e) => setDetails({ ...details, name: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setDetails({ ...details, phone: e.target.value })}
      />
      <textarea
        placeholder="Address"
        onChange={(e) => setDetails({ ...details, address: e.target.value })}
      />
      <button className="btn" disabled={!details.address} onClick={placeOrder}>
        Buy Now
      </button>
      <p style={{ marginTop: "20px", fontStyle: "italic" }}>
        "A party without cake is just a meeting." - Julia Child
      </p>
    </div>
  );
};

const AddProduct = () => {
  const [form, setForm] = useState({});
  const handleFile = (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => setForm({ ...form, image: reader.result });
  };
  const save = async () => {
    await axios.post(`${API}/products`, form);
    toast.success("Product Added!");
  };
  return (
    <div className="admin-form">
      <h2>Add New Delight</h2>
      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Price"
        type="number"
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <textarea
        placeholder="Description"
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input type="file" onChange={handleFile} />
      <button className="btn" onClick={save}>
        Save Product
      </button>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get(`${API}/orders`).then((res) => setOrders(res.data));
  }, []);

  const update = async (id, status) => {
    await axios.put(`${API}/orders/${id}`, { status });
    toast.success("Status Updated");
    window.location.reload();
  };

  return (
    <div style={{ padding: "100px 10%" }}>
      <h2>Global Orders</h2>
      {orders.map((o) => (
        <div
          key={o._id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>
            Customer: {o.userName} ({o.phone})
          </p>
          <p>
            Total: ${o.total} | Status: <b>{o.status}</b>
          </p>
          {o.status === "Pending" && (
            <>
              <button onClick={() => update(o._id, "Accepted")}>Accept</button>{" "}
              <button onClick={() => update(o._id, "Rejected")}>Reject</button>
            </>
          )}
          {o.status === "Accepted" && (
            <button onClick={() => update(o._id, "Delivered")}>
              Mark Delivered
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const MyOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get(`${API}/orders/${user.id}`).then((res) => setOrders(res.data));
  }, [user.id]);
  return (
    <div style={{ padding: "100px 10%" }}>
      <h2>My Past Orders</h2>
      {orders.map((o) => (
        <div key={o._id}>
          Order Total: ${o.total} - Status: {o.status}
        </div>
      ))}
    </div>
  );
};
