require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

const PORT = process.env.PORT || 2213;
const SECRET = process.env.JWT_SECRET;

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("Connected to MongoDB Atlas"))
//   .catch((err) => console.log("DB Error:", err));

mongoose
  .connect("mongodb://127.0.0.1:27017/deepbakes")
  .then(() => console.log("Connected to Bakery DB"))
  .catch((err) => console.log(err));

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
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
  const user = await User.findOne({ phone: req.body.phone });
  res.json({ exists: !!user });
});

app.post("/reset-password", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  await User.findOneAndUpdate(
    { phone: req.body.phone },
    { password: hashedPassword },
  );
  res.json({ message: "Password Updated" });
});

app.get("/products", async (req, res) => {
  res.json(await Product.find());
});

app.post("/products", async (req, res) => {
  const prod = new Product(req.body);
  await prod.save();
  res.json("Saved");
});

app.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Delete Failed" });
  }
});

app.post("/orders", async (req, res) => {
  try {
    console.log("req", req);
    const order = new Order(req.body);
    await order.save();
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
    res.json("Ordered");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Order Failed" });
  }
});

app.get("/orders", async (req, res) => {
  res.json(await Order.find());
});

app.get("/orders/:userId", async (req, res) => {
  res.json(await Order.find({ userId: req.params.userId }));
});

app.put("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    if (order.email) {
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
      console.log("Status email sent to:", order.email);
    } else {
    }
    res.json("Updated");
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Update Failed" });
  }
});

app.listen(PORT, () =>
  console.log(`Deep Bakes server running on port ${PORT}`),
);
