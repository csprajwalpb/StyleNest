import React, { useEffect, useState, useCallback } from "react";
import "./CSS/Orders.css";
import { backend_url } from "../config";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const token = localStorage.getItem("auth-token");

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${backend_url}/my-orders`, {
        headers: { "auth-token": token },
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }, [token]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // refresh every 10 sec
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Download invoice PDF
  const downloadInvoice = async (orderId) => {
    try {
      const res = await fetch(`${backend_url}/api/orders/invoice/${orderId}`, {
        headers: { "auth-token": token },
      });
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
    } catch (err) {
      console.error("Invoice error:", err);
      alert("Failed to download invoice");
    }
  };

  // Submit rating
  const submitRating = async (orderId) => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    try {
      const res = await fetch(`${backend_url}/api/orders/rate/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ rating, review }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Rating submitted successfully!");
        setRatingModal(null);
        setRating(0);
        setReview("");
        fetchOrders(); // refresh orders
      } else {
        alert(data.error || "Failed to submit rating");
      }
    } catch (err) {
      console.error("Rating error:", err);
      alert("Failed to submit rating");
    }
  };

  if (orders.length === 0) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>No orders yet</h2>;
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Your Orders</h2>
        <button className="refresh-btn" onClick={fetchOrders}>
          🔄 Refresh
        </button>
      </div>

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
              <p><b>Order ID:</b> {order._id}</p>
              <p><b>Date:</b> {new Date(order.createdAt).toDateString()}</p>
            </div>
            <div className="order-actions">
              <button className="download-btn" onClick={() => downloadInvoice(order._id)}>
                Download Invoice
              </button>
              {!order.rating && (
                <button className="rate-btn" onClick={() => setRatingModal(order._id)}>
                  Rate Order
                </button>
              )}
              {order.rating && (
                <div className="rating-display">
                  <span>⭐ {order.rating}/5</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-status">
            <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
              {order.orderStatus}
            </span>
            <span><b>Payment:</b> {order.paymentStatus}</span>
            <span><b>Total:</b> ₹{order.totalAmount}</span>
          </div>

          <hr />

          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <img src={`${backend_url}${item.image}`} alt={item.name} />
                <div className="item-details">
                  <p className="item-name">{item.name}</p>
                  <p className="item-price">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="rating-modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rate Your Order</h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${rating >= star ? "filled" : ""}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Write your review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
            />
            <div className="modal-actions">
              <button className="submit-btn" onClick={() => submitRating(ratingModal)}>
                Submit
              </button>
              <button className="cancel-btn" onClick={() => setRatingModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
