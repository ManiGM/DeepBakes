require("dotenv").config();
const dns = require("dns");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Razorpay = require("razorpay");
const bcrypt = require("bcryptjs");
dns.setDefaultResultOrder("ipv4first");
// Windows machines sometimes report an IPv6 link-local resolver (fe80::...)
// as the system DNS server, which Node's resolver can't query for SRV
// records (mongodb+srv:// lookups), even though the OS resolver works fine.
// Forcing a public resolver here avoids ECONNREFUSED on that SRV lookup.
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const app = express();
app.set("trust proxy", 1);
app.use("/webhook", express.raw({ type: "application/json" }));
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
const SECRET_KEY = process.env.SECRET_KEY_URL;

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
    paymentId: {
      type: String,
      unique: true,
      sparse: true, 
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

transporter.verify((error) => {
  if (error) {
    console.error("Email server error:", error);
  } else {
    console.log("Email server ready");
  }
});

function computeOrderTotals(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const tax = subtotal * 0.05;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = order.total != null ? Number(order.total) : subtotal + tax + deliveryFee;
  return { items, subtotal, tax, deliveryFee, total };
}

function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    const { items, subtotal, tax, deliveryFee, total } = computeOrderTotals(order);
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).fillColor("#e0447b").text("Deep Bakes");
    doc.fontSize(10).fillColor("#666").text("Flavour of Purity, Taste of Home");

    doc
      .fontSize(16)
      .fillColor("#111")
      .text("INVOICE", 50, 50, { align: "right" });
    doc
      .fontSize(9)
      .fillColor("#666")
      .text(`Order ID: ${order._id}`, { align: "right" })
      .text(
        `Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}`,
        { align: "right" },
      );

    doc.moveDown(2);
    doc.fontSize(11).fillColor("#111").text("Bill To:");
    doc
      .fontSize(10)
      .fillColor("#333")
      .text(order.userName || "")
      .text(order.phone || "")
      .text(order.address || "");

    doc.moveDown(1.5);
    let y = doc.y;

    doc.rect(50, y, 495, 22).fill("#e0447b");
    doc.fillColor("#fff").fontSize(10);
    doc.text("Item", 60, y + 6, { width: 240 });
    doc.text("Qty", 300, y + 6, { width: 50, align: "right" });
    doc.text("Price", 360, y + 6, { width: 80, align: "right" });
    doc.text("Total", 450, y + 6, { width: 85, align: "right" });
    y += 22;

    items.forEach((item, i) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      if (i % 2 === 1) {
        doc.rect(50, y, 495, 20).fill("#faf3f6");
      }
      doc.fillColor("#333").fontSize(9.5);
      doc.text(item.name || "", 60, y + 5, { width: 240 });
      doc.text(String(item.quantity || 0), 300, y + 5, { width: 50, align: "right" });
      doc.text(`Rs. ${Number(item.price || 0).toFixed(2)}`, 360, y + 5, {
        width: 80,
        align: "right",
      });
      doc.text(`Rs. ${lineTotal.toFixed(2)}`, 450, y + 5, { width: 85, align: "right" });
      y += 20;
    });

    y += 8;
    doc
      .moveTo(300, y)
      .lineTo(545, y)
      .strokeColor("#eee")
      .stroke();
    y += 10;

    const totalsRow = (label, value, bold) => {
      doc.fontSize(bold ? 11 : 9.5).fillColor(bold ? "#111" : "#555");
      doc.text(label, 300, y, { width: 145, align: "left" });
      doc.text(value, 450, y, { width: 85, align: "right" });
      y += bold ? 20 : 16;
    };
    totalsRow("Subtotal:", `Rs. ${subtotal.toFixed(2)}`);
    totalsRow("Tax (5%):", `Rs. ${tax.toFixed(2)}`);
    totalsRow("Delivery:", deliveryFee === 0 ? "Free" : `Rs. ${deliveryFee.toFixed(2)}`);
    totalsRow("Total:", `Rs. ${total.toFixed(2)}`, true);

    doc.moveDown(4);
    doc
      .fontSize(9)
      .fillColor("#999")
      .text("Thank you for choosing Deep Bakes! This is a computer-generated invoice.", 50, y + 30, {
        align: "center",
        width: 495,
      });

    doc.end();
  });
}

async function sendOrderEmails(order) {
  const ownerHtml = `
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
      <p><strong>Total Amount:</strong> ₹${Number(order.total || 0).toFixed(2)}</p>
      <p><strong>Status:</strong> ${order.status}</p>

      <div style="margin-top:25px; padding:15px; background:#fff3f8; border-radius:6px;">
        <strong>Please log in to the admin panel to process this order.</strong>
      </div>

      <p style="margin-top:25px; font-size:12px; color:#888;">
        This is an automated notification from DeepBakes.
      </p>

    </div>
  </div>
  `;

  const customerHtml = `
  <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:8px;">

      <h2 style="color:#e91e63;">Thank you for your order!</h2>
      <p>Hello <strong>${order.userName}</strong>,</p>
      <p>We’ve successfully received your order and it is now being processed.</p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">

      <h3>Order Details</h3>
      <p><strong>Total Amount:</strong> ₹${Number(order.total || 0).toFixed(2)}</p>
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
  `;

  let invoiceBuffer = null;
  try {
    invoiceBuffer = await generateInvoicePDF(order);
  } catch (err) {
    console.error("Invoice generation failed:", err);
  }

  const [ownerResult, customerResult] = await Promise.allSettled([
    transporter.sendMail({
      from: `"DeepBakes Orders" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `🆕 New Order Received — ${order.userName}`,
      html: ownerHtml,
    }),
    transporter.sendMail({
      from: `"DeepBakes" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: "✅ Order Confirmed — DeepBakes",
      html: customerHtml,
      attachments: invoiceBuffer
        ? [
            {
              filename: `Invoice-${order._id}.pdf`,
              content: invoiceBuffer,
              contentType: "application/pdf",
            },
          ]
        : [],
    }),
  ]);

  if (ownerResult.status === "rejected") {
    console.error("Owner order email failed:", ownerResult.reason);
  }
  if (customerResult.status === "rejected") {
    console.error("Customer order email failed:", customerResult.reason);
  }
  const ownerOk = ownerResult.status !== "rejected";
  const customerOk = customerResult.status !== "rejected";
  if (ownerOk && customerOk) {
    console.log("Order emails sent successfully");
  } else if (ownerOk || customerOk) {
    console.log(
      `Order email partially sent (owner: ${ownerOk ? "ok" : "failed"}, customer: ${customerOk ? "ok" : "failed"})`,
    );
  }
}

async function sendStatusEmail(order) {
  const html = `
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
  `;

  try {
    await transporter.sendMail({
      from: `"DeepBakes" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: `Order ${order.status} — DeepBakes`,
      html,
    });
    console.log("Status email sent successfully");
  } catch (error) {
    console.error("Status email failed:", error);
  }
}

const decryptPassword = (password) => {
  const bytes = CryptoJS.AES.decrypt(password, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = JSON.parse(req.body.toString());
      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const notes = payment.notes;
        const paymentId = payment?.id;
        if (!paymentId) {
          return res.status(400).send("No paymentId");
        }
        let existingOrder = await Order.findOne({ paymentId });
        if (!existingOrder) {
          existingOrder = await Order.findOne({
            email: notes?.email,
            total: Number(notes?.total || 0),
            createdAt: {
              $gte: new Date(Date.now() - 5 * 60 * 1000),
            },
          });
        }
        if (existingOrder) {
          return res.status(200).json({ status: "OK" });
        }
        const orderData = {
          userId: notes?.userId || "",
          userName: notes?.userName || "",
          email: notes?.email || "",
          phone: notes?.phone || "",
          address: notes?.address || "",
          items: JSON.parse(notes?.items || "[]"),
          total: Number(notes?.total || 0),
          paymentId,
          status: "Pending",
        };
        const order = new Order(orderData);
        await order.save();
        await sendOrderEmails(order);
      }

      res.status(200).json({ status: "ok" });
    } catch (err) {
      console.error("Webhook Error:", err);
      res.status(500).send("Webhook Failed");
    }
  },
);

app.post("/payment/create-order", async (req, res) => {
  try {
    const { amount, userId, userName, email, phone, address, items, total } =
      req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "Receipt_" + Date.now(),
      notes: {
        userId,
        userName,
        email,
        phone,
        address,
        items: JSON.stringify(items),
        total,
      },
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order Creation Failed" });
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
    const decryptedPassword = decryptPassword(password);
    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "Phone Number Already Exists" });
    }
    const hashedPassword = await bcrypt.hash(decryptedPassword, 10);
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
    const decryptedPassword = decryptPassword(req.body.password);
    if (user && (await bcrypt.compare(decryptedPassword, user.password))) {
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
    } else if (user && (await bcrypt.compare("", user.password))) {
      // Accounts created while SECRET_KEY_URL was misconfigured had their
      // password silently hashed as an empty string; the original password
      // was never actually stored, so it cannot be recovered — the account
      // needs a fresh password via the reset flow.
      res
        .status(400)
        .json(
          "Your password needs to be reset due to a security update. Please use 'Forgot Password' to set a new one.",
        );
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
    const decryptedPassword = decryptPassword(password);
    const hashedPassword = await bcrypt.hash(decryptedPassword, 10);
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
    const products = await Product.find().select("-image").lean();
    res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/products/:id/image", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("image").lean();
    if (!product?.image) {
      return res.status(404).end();
    }
    const match = /^data:(image\/[a-zA-Z+]+);base64,(.*)$/.exec(product.image);
    if (!match) {
      return res.status(404).end();
    }
    const [, mime, base64] = match;
    res.set("Content-Type", mime);
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(base64, "base64"));
  } catch (error) {
    res.status(500).end();
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
    res.status(200).json("Ordered");
    setImmediate(() => sendOrderEmails(order));
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
    res.status(200).json("Updated");
    if (order?.email) {
      setImmediate(() => sendStatusEmail(order));
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
