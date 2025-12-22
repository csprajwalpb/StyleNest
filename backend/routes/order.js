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

module.exports = router;
