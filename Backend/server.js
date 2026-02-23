// const express = require("express");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// app.use(express.json({ limit: "50mb" }));
// app.use(cors());

// const PORT = 2213;
// // const PORT = process.env.PORT || 2213;
// const SECRET = "secret123";

// // const DATA_DIR = path.join(__dirname, "data");
// const DATA_DIR = path.join(process.cwd(), "data");
// if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// // ---------- helpers ----------
// const dataPath = (file) => path.join(DATA_DIR, file);

// const readData = (file) => {
//   try {
//     return JSON.parse(fs.readFileSync(dataPath(file)));
//   } catch {
//     return [];
//   }
// };

// const writeData = (file, data) => {
//   fs.writeFileSync(dataPath(file), JSON.stringify(data, null, 2));
// };

// const generateId = () => Date.now().toString();

// // ---------- 30 DAY CLEANUP ----------
// const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// const cleanupOldData = (records) => {
//   const now = Date.now();
//   return records.filter((item) => {
//     if (!item.createdAt) return true;
//     return now - new Date(item.createdAt).getTime() <= THIRTY_DAYS;
//   });
// };

// const saveWithCleanup = (file, data) => {
//   const cleaned = cleanupOldData(data);
//   writeData(file, cleaned);
// };

// // ---------- AUTH ----------

// app.post("/register", async (req, res) => {
//   try {
//     let users = readData("users.json");
//     users = cleanupOldData(users);

//     const exists = users.find(
//       (u) => u.username.toLowerCase() === req.body.username.toLowerCase(),
//     );

//     if (exists) {
//       return res.status(400).json({ message: "Username already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(req.body.password, 10);

//     const newUser = {
//       _id: generateId(),
//       username: req.body.username,
//       password: hashedPassword,
//       phone: req.body.phone || "",
//       role: "user",
//       createdAt: new Date().toISOString(),
//     };

//     users.push(newUser);
//     saveWithCleanup("users.json", users);

//     res.json({ message: "Registered successfully" });
//   } catch {
//     res.status(500).json({ message: "Registration failed" });
//   }
// });

// app.post("/login", async (req, res) => {
//   let users = cleanupOldData(readData("users.json"));

//   const user = users.find((u) => u.username === req.body.username);

//   if (user && (await bcrypt.compare(req.body.password, user.password))) {
//     const token = jwt.sign(
//       { id: user._id, role: user.role, username: user.username },
//       SECRET,
//     );

//     res.json({
//       token,
//       role: user.role,
//       username: user.username,
//       id: user._id,
//     });
//   } else {
//     res.status(400).json("Invalid Credentials");
//   }
// });

// // ---------- PRODUCTS ----------

// app.get("/products", (req, res) => {
//   const products = cleanupOldData(readData("products.json"));
//   saveWithCleanup("products.json", products);
//   res.json(products);
// });

// app.post("/products", (req, res) => {
//   let products = readData("products.json");

//   const newProduct = {
//     _id: generateId(),
//     ...req.body,
//     createdAt: new Date().toISOString(),
//   };

//   products.push(newProduct);
//   saveWithCleanup("products.json", products);

//   res.json("Saved");
// });

// // ---------- ORDERS ----------

// app.post("/orders", (req, res) => {
//   let orders = readData("orders.json");

//   const newOrder = {
//     _id: generateId(),
//     ...req.body,
//     status: "Pending",
//     createdAt: new Date().toISOString(),
//   };

//   orders.push(newOrder);
//   saveWithCleanup("orders.json", orders);

//   res.json("Ordered");
// });

// app.get("/orders", (req, res) => {
//   const orders = cleanupOldData(readData("orders.json"));
//   saveWithCleanup("orders.json", orders);
//   res.json(orders);
// });

// app.get("/orders/:userId", (req, res) => {
//   let orders = cleanupOldData(readData("orders.json"));
//   orders = orders.filter((o) => o.userId === req.params.userId);
//   saveWithCleanup("orders.json", orders);
//   res.json(orders);
// });

// app.put("/orders/:id", (req, res) => {
//   let orders = cleanupOldData(readData("orders.json"));

//   orders = orders.map((o) =>
//     o._id === req.params.id ? { ...o, status: req.body.status } : o,
//   );

//   saveWithCleanup("orders.json", orders);
//   res.json("Updated");
// });

// // ---------- START ----------
// app.listen(PORT, () =>
//   console.log(`Deep Bakes server running on port ${PORT}`),
// );

// local mongo

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const app = express();
// app.use(express.json({ limit: "50mb" })); // Higher limit for Base64 images
// app.use(cors());

// // Connect to Local MongoDB
// mongoose
//   .connect("mongodb://127.0.0.1:27017/deepbakes")
//   .then(() => console.log("Connected to Bakery DB"))
//   .catch((err) => console.log(err));

// // --- SCHEMAS ---
// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phone: String,
//   role: { type: String, default: "user" }, // 'user' or 'admin'
// });

// const ProductSchema = new mongoose.Schema({
//   name: String,
//   description: String,
//   price: Number,
//   image: String,
// });

// const OrderSchema = new mongoose.Schema({
//   userId: String,
//   userName: String,
//   phone: String,
//   address: String,
//   items: Array,
//   total: Number,
//   status: { type: String, default: "Pending" },
// });

// const User = mongoose.model("User", UserSchema);
// const Product = mongoose.model("Product", ProductSchema);
// const Order = mongoose.model("Order", OrderSchema);

// // --- ROUTES ---

// // Auth
// app.post("/register", async (req, res) => {
//   const hashedPassword = await bcrypt.hash(req.body.password, 10);
//   const user = new User({ ...req.body, password: hashedPassword });
//   await user.save();
//   res.json({ message: "Registered" });
// });

// app.post("/login", async (req, res) => {
//   const user = await User.findOne({ username: req.body.username });
//   if (user && (await bcrypt.compare(req.body.password, user.password))) {
//     const token = jwt.sign(
//       { id: user._id, role: user.role, username: user.username },
//       "secret123",
//     );
//     res.json({ token, role: user.role, username: user.username, id: user._id });
//   } else {
//     res.status(400).json("Invalid Credentials");
//   }
// });

// // Products
// app.get("/products", async (req, res) => res.json(await Product.find()));
// app.post("/products", async (req, res) => {
//   const prod = new Product(req.body);
//   await prod.save();
//   res.json("Saved");
// });

// // Orders
// app.post("/orders", async (req, res) => {
//   const order = new Order(req.body);
//   await order.save();
//   res.json("Ordered");
// });

// app.get("/orders", async (req, res) => res.json(await Order.find()));
// app.get("/orders/:userId", async (req, res) =>
//   res.json(await Order.find({ userId: req.params.userId })),
// );

// app.put("/orders/:id", async (req, res) => {
//   await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
//   res.json("Updated");
// });

// app.listen(2213, () => console.log("Server running on port 2213"));

// Hosting Mongo

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// ---------- CONFIG ----------
const PORT = process.env.PORT || 2213;
const SECRET = process.env.JWT_SECRET;

// ---------- DB CONNECTION ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log("DB Error:", err));

// ---------- SCHEMAS ----------
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, default: "user" },
});

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema(
  {
    userId: String,
    userName: String,
    phone: String,
    address: String,
    items: Array,
    total: Number,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

// ---------- AUTH ----------
app.post("/register", async (req, res) => {
  try {
    const exists = await User.findOne({ username: req.body.username });
    if (exists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashedPassword });

    await user.save();
    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      SECRET,
    );

    res.json({
      token,
      role: user.role,
      username: user.username,
      id: user._id,
    });
  } else {
    res.status(400).json("Invalid Credentials");
  }
});

// ---------- PRODUCTS ----------
app.get("/products", async (req, res) => {
  res.json(await Product.find());
});

app.post("/products", async (req, res) => {
  const prod = new Product(req.body);
  await prod.save();
  res.json("Saved");
});

// ---------- ORDERS ----------
app.post("/orders", async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.json("Ordered");
});

app.get("/orders", async (req, res) => {
  res.json(await Order.find());
});

app.get("/orders/:userId", async (req, res) => {
  res.json(await Order.find({ userId: req.params.userId }));
});

app.put("/orders/:id", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });
  res.json("Updated");
});

// ---------- START ----------
app.listen(PORT, () =>
  console.log(`Deep Bakes server running on port ${PORT}`),
);
