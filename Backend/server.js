const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json({ limit: "50mb" })); // Higher limit for Base64 images
app.use(cors());

// Connect to Local MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/deepbakes")
  .then(() => console.log("Connected to Bakery DB"))
  .catch((err) => console.log(err));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, default: "user" }, // 'user' or 'admin'
});

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  phone: String,
  address: String,
  items: Array,
  total: Number,
  status: { type: String, default: "Pending" },
});

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

// --- ROUTES ---

// Auth
app.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({ ...req.body, password: hashedPassword });
  await user.save();
  res.json({ message: "Registered" });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      "secret123",
    );
    res.json({ token, role: user.role, username: user.username, id: user._id });
  } else {
    res.status(400).json("Invalid Credentials");
  }
});

// Products
app.get("/products", async (req, res) => res.json(await Product.find()));
app.post("/products", async (req, res) => {
  const prod = new Product(req.body);
  await prod.save();
  res.json("Saved");
});

// Orders
app.post("/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json("Ordered");
});

app.get("/orders", async (req, res) => res.json(await Order.find()));
app.get("/orders/:userId", async (req, res) =>
  res.json(await Order.find({ userId: req.params.userId })),
);

app.put("/orders/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json("Updated");
});

app.listen(2213, () => console.log("Server running on port 2213"));
