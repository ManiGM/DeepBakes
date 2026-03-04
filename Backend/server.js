require("dotenv").config();
const dns = require("dns");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
dns.setDefaultResultOrder("ipv4first");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const app = express();
app.set("trust proxy", 1);
const compression = require("compression");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://deepbakes.vercel.app",
      "https://deepbakes.netlify.app",
    ],
    credentials: true,
  }),
);

const PORT = process.env.PORT || 2213;
const SECRET = process.env.JWT_SECRET;

mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

const http = require("http");
const https = require("https");

http.globalAgent.keepAlive = true;
https.globalAgent.keepAlive = true;

mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log("DB Error:", err));

// mongoose
//   .connect("mongodb://127.0.0.1:27017/deepbakes")
//   .then(() => console.log("Connected to Bakery DB"))
//   .catch((err) => console.log(err));

mongoose.connection.once("open", async () => {
  await mongoose.connection.db.admin().ping();
  console.log("MongoDB warm connection ready");
});

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
    email: String,
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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Port 465 is more stable on cloud firewalls
  secure: true, // Required for 465
  pool: true, // IMPORTANT: Keeps the connection alive
  maxConnections: 5, // Limits simultaneous connections
  maxMessages: 100, // Rotates connections after 100 emails
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // NO SPACES in Render Dashboard
  },
  // High timeouts to handle Render's "cold starts"
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
  tls: {
    servername: "smtp.gmail.com",
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email server error:", error);
  } else {
    console.log("Email Server Ready");
  }
});

app.use((req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", "public, max-age=60");
  }
  next();
});

app.get("/health", (req, res) => {
  res.status(200).type("text/plain").send("OK");
});

app.post("/register", async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "Phone Number Already Exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      phone,
      password: hashedPassword,
    });
    await user.save();
    res.json({ success: true, message: "Registered Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration Failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const input = req.body.username?.trim();
    let query = {};
    const onlyDigits = /^\d+$/.test(input);
    if (onlyDigits) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(input)) {
        return res
          .status(400)
          .json("Phone number must be 10 digits and start with 6, 7, 8, or 9");
      }
      query = { phone: input };
    } else {
      query = { username: input };
    }
    const user = await User.findOne(query);
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
  } catch (error) {
    res.status(500).json("Server error");
  }
});

app.post("/check-user", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }
    const user = await User.findOne({ phone });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findOneAndUpdate(
      { phone },
      { password: hashedPassword },
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Password Updated" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const prod = new Product(req.body);
    await prod.save();
    res.status(201).json({ message: "Product saved" });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete Failed" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Fetch Failed" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Product Updated" });
  } catch (error) {
    res.status(500).json({ error: "Update Failed" });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    // ✅ SEND RESPONSE FIRST (important for production)
    res.status(200).json("Ordered");
    // ✅ SEND EMAILS IN BACKGROUND (do not block API)
    setImmediate(async () => {
      try {
        await transporter.sendMail({
          from: `"DeepBakes Orders" <${process.env.EMAIL_USER}>`,
          to: process.env.OWNER_EMAIL,
          subject: `🆕 New Order Received — ${order.userName}`,
          html: `
    <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:8px;">
      
      <h2 style="color:#e91e63; margin-bottom:5px;">New Order Received</h2>
      <p style="color:#555;">A new customer order has been placed.</p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">

      <h3 style="margin-bottom:10px;">Customer Details</h3>
      <p><strong>Name:</strong> ${order.userName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Address:</strong> ${order.address}</p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">

      <h3 style="margin-bottom:10px;">Order Summary</h3>
      <p><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
      <p><strong>Status:</strong> ${order.status}</p>

      <div style="margin-top:25px; padding:15px; background:#fff3f8; border-radius:6px;">
        <strong>Please log in to the admin panel to process this order.</strong>
      </div>

      <p style="margin-top:25px; font-size:12px; color:#888;">
        This is an automated notification from DeepBakes.
      </p>

    </div>
  </div>
  `,
        });
        await transporter.sendMail({
          from: `"DeepBakes" <${process.env.EMAIL_USER}>`,
          to: order.email,
          subject: "✅ Order Confirmed — DeepBakes",
          html: `
  <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:8px;">

      <h2 style="color:#e91e63;">Thank you for your order!</h2>
      <p>Hello <strong>${order.userName}</strong>,</p>
      <p>We’ve successfully received your order and it is now being processed.</p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">

      <h3>Order Details</h3>
      <p><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
      <p><strong>Delivery Address:</strong> ${order.address}</p>
      <p><strong>Status:</strong> Pending</p>

      <div style="margin-top:20px; padding:15px; background:#f0f8ff; border-radius:6px;">
        You will receive another email when your order is accepted and delivered.
      </div>

      <p style="margin-top:25px;">
        We appreciate your trust in DeepBakes 💖
      </p>

      <p style="font-size:12px; color:#888;">
        This is an automated email. Please do not reply.
      </p>

    </div>
  </div>
  `,
        });
        console.log("Order emails sent successfully");
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order Failed" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

app.put("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    // ✅ SEND RESPONSE FIRST (important)
    res.status(200).json("Updated");
    // ✅ SEND EMAIL IN BACKGROUND (non-blocking)
    if (order?.email) {
      setImmediate(async () => {
        try {
          await transporter.sendMail({
            from: `"DeepBakes" <${process.env.EMAIL_USER}>`,
            to: order.email,
            subject: `Order ${order.status} — DeepBakes`,
            html: `
    <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:30px;">

      <h2 style="color:#e91e63; margin-bottom:5px;">Order Status Update</h2>
      <p style="color:#555; margin-top:0;">
        Hello <strong>${order.userName}</strong>,
      </p>

      <p>Your order status has been updated. Please find the details below:</p>

      <div style="margin:25px 0; padding:20px; background:#fafafa; border-radius:6px; text-align:center;">
        <div style="font-size:14px; color:#777;">Current Status</div>
        <div style="font-size:24px; font-weight:bold; color:#333;">
          ${order.status}
        </div>
      </div>

      <div style="margin:20px 0;">
        <p><strong>Order Total:</strong> ₹${Number(order.total || 0).toFixed(2)}</p>
        <p><strong>Delivery Address:</strong> ${order.address}</p>
      </div>

      ${
        order.status === "Accepted"
          ? `<p>Your order has been accepted and is being prepared with care 🎂</p>`
          : ""
      }

      ${
        order.status === "Delivered"
          ? `<p>Your order has been delivered. We hope you enjoy your treats! 💖</p>`
          : ""
      }

      ${
        order.status === "Rejected"
          ? `<p>Unfortunately, your order could not be processed. If you need help, please contact support.</p>`
          : ""
      }

      <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">

      <p style="margin-bottom:5px;">Thank you for choosing <strong>DeepBakes</strong>.</p>
      <p style="font-size:12px; color:#888;">
        This is an automated notification. Please do not reply to this email.
      </p>

    </div>
  </div>
  `,
          });
          console.log("Status email sent successfully");
        } catch (emailError) {
          console.error("Status email failed:", emailError);
        }
      });
    }
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Update Failed" });
  }
});

const server = app.listen(PORT, () =>
  console.log(`Deep Bakes server running on port ${PORT}`),
);

server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;
