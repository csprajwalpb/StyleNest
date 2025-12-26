const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config(); 
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const port = process.env.PORT || 4000;
const Order = require("./models/Order");
const nodemailer = require("nodemailer");
const generateInvoiceBuffer = require("./utils/invoiceGenerator");
const sendInvoiceEmail = require("./utils/sendInvoiceEmail");
const wishlistRoutes = require("./routes/wishlist");
const promoRoutes = require("./routes/promo");

app.use(express.json());
app.use(cors());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true
}));


const orderRoutes = require("./routes/order");
app.use("/api/orders", orderRoutes);

// Wishlist Routes
app.use("/api/wishlist", wishlistRoutes);

// Promo Routes
app.use("/api/promo", promoRoutes);

// Database Connection With MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// paste your mongoDB Connection string above with password
// password should not contain '@' or any other special character


//Image Storage Engine 
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage: storage })
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  })
})


// Route for Images folder
app.use('/images', express.static('upload/images'));


// MiddleWare to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  console.log("TOKEN RECEIVED:", token);
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, `${process.env.JWT_SECRET}`);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

const razorpay = new Razorpay({
  key_id: `${process.env.RAZORPAY_KEY_ID}`,
  key_secret: `${process.env.RAZORPAY_KEY_SECRET}`,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Schema for creating user model
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  date: { type: Date, default: Date.now() },
});


// Schema for creating Product
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});


// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});


// Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      }
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, `${process.env.JWT_SECRET}`);
      res.json({ success, token });
    }
    else {
      return res.status(400).json({ success: success, errors: "please try with correct email/password" })
    }
  }
  else {
    return res.status(400).json({ success: success, errors: "please try with correct email/password" })
  }
})


//Create an endpoint at ip/auth for registering the user & sending auth-token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: success, errors: "existing user found with this email" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();

  const token = jwt.sign(
    { user: { id: user.id } },
    process.env.JWT_SECRET
  );

  success = true;
  res.json({ success, token });
});
  
//create endpoint for forget password 
//create endpoint for forget password 
app.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.json({ message: "If account exists, reset link sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset - StyleNest",
      text: `
You requested a password reset.

Click the link below:
${resetURL}

This link expires in 15 minutes.
      `,
    });

    res.json({ message: "Password reset link sent to email" });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});


//reset password API
app.post("/reset-password/:token", async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await Users.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.json({ message: "Password reset successful" });
});
  

// endpoint for getting all products data
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});


// endpoint for getting latest products data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(0).slice(-8);
  console.log("New Collections");
  res.send(arr);
});
// endpoint for getting womens products data
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let arr = products.splice(0, 4);
  console.log("Popular In Women");
  res.send(arr);
});

// endpoint for getting womens products data
app.post("/relatedproducts", async (req, res) => {
  console.log("Related Products");
  const {category} = req.body;
  const products = await Product.find({ category });
  const arr = products.slice(0, 4);
  res.send(arr);
});


// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (!userData.cartData[req.body.itemId]) {
    userData.cartData[req.body.itemId] = 0;
  }
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Added")
})


// Create an endpoint for removing the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Removed");
})


// Create an endpoint for getting cartdata of user
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);

})


// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else { id = 1; }
  const product = new Product({
    id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name })
});


// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name })
});


// Razorpay Payment Gateway Integration
app.post("/create-order", fetchuser, async (req, res) => {
  console.log("Creating order with key:", razorpay.key_id);
  try {
    const { amount } = req.body; // amount in rupees
    console.log("Amount received:", req.body.amount);
    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Order creation failed");
  }
});

// Verify Payment and Clear Cart
app.post("/verify-payment", fetchuser, async (req, res) => {
  
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    discountCode,
    discountAmount
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

  if (expectedSignature === razorpay_signature) {

  // 1️⃣ Get user
  const user = await Users.findById(req.user.id);

  // 2️⃣ Build items array from cart
  const items = [];

  for (const productId in user.cartData) {
    if (user.cartData[productId] > 0) {
      const product = await Product.findOne({ id: Number(productId) });

      if (product) {
        items.push({
          productId: product.id,
          name: product.name,
          price: product.new_price,
          quantity: user.cartData[productId],
          image: product.image
        });
      }
    }
  }

  // 3️⃣ Calculate total
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  let validDiscount = 0;

  if (discountCode === "CHRISTMAS25") {
    validDiscount = Math.floor((totalAmount * 25) / 100);
  }

  const payableAmount = totalAmount - validDiscount;

  // 4️⃣ Save order
  const order = new Order({
    userId: req.user.id,
    items,
    totalAmount,
    discountCode: discountCode || null,
    discountAmount: validDiscount,
    finalAmount: payableAmount,
    razorpay_order_id,
    razorpay_payment_id,
    paymentStatus: "Paid",
    orderStatus: "Placed"
  });

  await order.save();
  // Generate invoice PDF
const pdfBuffer = await generateInvoiceBuffer(order);

// Send invoice email
await sendInvoiceEmail(order, user.email, pdfBuffer);


  // 5️⃣ Clear cart
  let emptyCart = {};
  for (let i = 0; i < 300; i++) {
    emptyCart[i] = 0;
  }

  user.cartData = emptyCart;
  await user.save();

  res.status(200).json({ success: true, orderId: order._id });
}

});


// Chat API Route
const chatRoutes = require("./routes/chat");
app.use("/api", chatRoutes);


// Get logged-in user's orders
app.get("/my-orders", fetchuser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


// Analytics API Endpoint
app.get("/analytics", async (req, res) => {
  try {
    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total users
    const totalUsers = await Users.countDocuments();

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "Paid",
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          revenue: { $sum: "$finalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedRevenueByMonth = revenueByMonth.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue
    }));

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          value: { $sum: 1 }
        }
      }
    ]);

    const formattedOrdersByStatus = ordersByStatus.map(item => ({
      name: item._id,
      value: item.value
    }));

    // Top products (based on order frequency)
    const topProductsData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          sales: { $sum: "$items.quantity" }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    const formattedTopProducts = topProductsData.map(item => ({
      name: item.name.substring(0, 20) + (item.name.length > 20 ? '...' : ''),
      sales: item.sales
    }));

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedCategoryDistribution = categoryDistribution.map(item => ({
      name: item._id,
      count: item.count
    }));

    // Recent orders
    const recentOrdersData = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name');

    const formattedRecentOrders = recentOrdersData.map(order => ({
      orderId: order._id.toString().substring(0, 8),
      customerName: order.userId?.name || 'Guest',
      date: order.createdAt,
      amount: order.finalAmount,
      status: order.orderStatus
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        revenueByMonth: formattedRevenueByMonth,
        ordersByStatus: formattedOrdersByStatus,
        topProducts: formattedTopProducts,
        categoryDistribution: formattedCategoryDistribution,
        recentOrders: formattedRecentOrders
      }
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch analytics data" 
    });
  }
});


// Starting Express Server
const PORT = process.env.PORT || 4000;
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});