import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("auth-token");

// Function to download invoice PDF
  const downloadInvoice = async (orderId) => {
  const res = await fetch(
    `http://localhost:4000/api/orders/invoice/${orderId}`,
    {
      headers: {
        "auth-token": localStorage.getItem("auth-token"),
      },
    }
  );
  if (!res.ok) {
    const errText = await res.text();
  console.error("Invoice download failed:", errText);
    alert("Failed to download invoice");
    return;
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice_${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(url);
};


  useEffect(() => {
    fetch("http://localhost:4000/my-orders", {
      headers: {
        "auth-token": token,
      },
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, []);

  if (orders.length === 0) {
    return <h2 style={{ textAlign: "center" }}>No orders yet</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Orders</h2>

      {orders.map(order => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px"
          }}
        >
          <p><b>Order ID:</b> {order._id}</p>
          <p><b>Date:</b> {new Date(order.createdAt).toDateString()}</p>
          <p><b>Status:</b> {order.orderStatus}</p>
          <p><b>Payment:</b> {order.paymentStatus}</p>
          <p><b>Total:</b> ₹{order.totalAmount}</p>

          <hr />

          {order.items.map((item, index) => (
            <div key={index} style={{ display: "flex", marginBottom: "10px" }}>
              <img
                src={`http://localhost:4000${item.image}`}
                alt={item.name}
                width="60"
                style={{ marginRight: "10px" }}
              />
              <div>
                <p>{item.name}</p>
                <p>
                  ₹{item.price} × {item.quantity}
                </p>
                <button onClick={() => downloadInvoice(order._id)}>
  Download Invoice
</button>

              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Orders;
