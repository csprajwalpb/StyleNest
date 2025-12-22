const PDFDocument = require("pdfkit");

const generateInvoiceBuffer = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on("error", reject);

    // ----- PDF CONTENT -----
    doc.fontSize(20).text("StyleNest Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.text(`Order Status: ${order.orderStatus}`);
    doc.moveDown();

    doc.fontSize(14).text("Items");
    doc.moveDown(0.5);

    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} | ₹${item.price} × ${item.quantity}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, {
      align: "right",
    });

    doc.moveDown(2);
    doc.fontSize(10).text(
      "Thank you for shopping with StyleNest 💖",
      { align: "center" }
    );

    doc.end();
  });
};

module.exports = generateInvoiceBuffer;
