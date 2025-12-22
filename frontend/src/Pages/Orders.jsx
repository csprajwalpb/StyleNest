import React, { useEffect, useState } from "react";
import "./CSS/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const token = localStorage.getItem("auth-token");

  const downloadInvoice = async (orderId) => {
    const res = await fetch(`http://localhost:4000/api/orders/invoice/${orderId}`, {
      headers: { "auth-token": token },
    });
    if (!res.ok) return alert("Failed to download invoice");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  useEffect(() => {
    fetch("http://localhost:4000/my-orders", { headers: { "auth-token": token } })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  }, [token]);

  if (orders.length === 0) return <div className="no-orders"><h2>No orders yet</h2></div>;

  return (
    <div className="orders-page">
      <div className="orders-header-section">
        <h1>Order History</h1>
        <p>Manage and track your premium StyleNest purchases</p>
      </div>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="premium-order-card">
            <div className="card-top">
              <div className="order-meta">
                <span className="order-id-badge">ID: #{order._id.slice(-6)}</span>
                <span className="order-date">{new Date(order.createdAt).toDateString()}</span>
              </div>
              <button className="premium-download-btn" onClick={() => downloadInvoice(order._id)}>
                <i className="fa fa-download"></i> Invoice
              </button>
            </div>

            <div className="card-main">
              {order.items.map((item, index) => (
                <div key={index} className="product-row">
                  <img src={`http://localhost:4000${item.image}`} alt="" />
                  <div className="product-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity} | Price: ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-footer">
              <div className="status-group">
                <span className={`badge ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
                <span className={`badge-payment ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span>
              </div>
              <div className="total-group">
                <p>Grand Total</p>
                <h3>₹{order.totalAmount}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;