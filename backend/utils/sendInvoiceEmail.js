const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (order, userEmail, pdfBuffer) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"StyleNest" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Invoice for Order ${order._id}`,
      text: `Hello, please find attached invoice for your order ${order._id}`,
      attachments: [
        {
          filename: `invoice_${order._id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("Invoice email sent to", userEmail);
  } catch (error) {
    console.error("Failed to send invoice email:", error);
  }
};

module.exports = sendInvoiceEmail;
