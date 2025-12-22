import React, { useEffect, useState } from "react";
import "./CSS/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/orders/all");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/orders/status/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Order status updated successfully!");
        fetchOrders();
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="admin-orders-container"><h2>Loading orders...</h2></div>;
  }

  if (orders.length === 0) {
    return <div className="admin-orders-container"><h2>No orders found</h2></div>;
  }

  return (
    <div className="admin-orders-container">
      <h2>Manage Orders</h2>

      <div className="orders-table">
        {orders.map((order) => (
          <div key={order._id} className="admin-order-card">
            <div className="admin-order-header">
              <div className="order-info">
                <p><b>Order ID:</b> {order._id}</p>
                <p><b>Customer:</b> {order.userId?.name || "N/A"}</p>
                <p><b>Email:</b> {order.userId?.email || "N/A"}</p>
                <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="order-info">
                <p><b>Total:</b> ₹{order.totalAmount}</p>
                <p><b>Payment:</b> <span className={`payment-${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></p>
                {order.rating && (
                  <p><b>Rating:</b> ⭐ {order.rating}/5</p>
                )}
              </div>
            </div>

            <div className="status-control">
              <label><b>Order Status:</b></label>
              <select
                value={order.orderStatus}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                className="status-dropdown"
              >
                <option value="Placed">Placed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="order-items-admin">
              <h4>Items:</h4>
              {order.items.map((item, index) => (
                <div key={index} className="admin-item">
                  <img src={`http://localhost:4000${item.image}`} alt={item.name} />
                  <div className="admin-item-details">
                    <p className="item-name">{item.name}</p>
                    <p>Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {order.review && (
              <div className="customer-review">
                <h4>Customer Review:</h4>
                <p>{order.review}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
