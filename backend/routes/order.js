const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const fetchUser = require("../middleware/fetchUser");
const generateInvoiceBuffer = require("../utils/invoiceGenerator");

// GET invoice PDF
router.get("/invoice/:orderId", fetchUser, async (req, res) => {
  console.log("📥 Invoice download request hit");
  try {
    console.log("Order ID:", req.params.orderId);
    console.log("User ID from token:", req.user.id);
    const order = await Order.findById(req.params.orderId);

    if (!order){ 
      console.log("❌ Order not found");
      return res.status(404).json({ error: "Order not found" });
    }
    console.log("Order userId:", order.userId.toString());

    if (order.userId.toString() !== req.user.id){
      console.log("❌ Unauthorized access attempt");
      return res.status(403).json({ error: "Unauthorized" });
    }
    const pdfBuffer = await generateInvoiceBuffer(order);
    console.log("PDF Buffer size:",pdfBuffer.length);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice_${order._id}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("Invoice download error: ",err);
    res.status(500).json({ error: "Invoice generation failed" });
  }
});

// POST rate order
router.post("/rate/:orderId", fetchUser, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    order.rating = rating;
    order.review = review || "";
    await order.save();

    res.json({ success: true, message: "Rating submitted successfully" });
  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

// PATCH update order status (admin only)
router.patch("/status/:orderId", async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["Placed", "Shipped", "Delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// GET all orders (admin)
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
