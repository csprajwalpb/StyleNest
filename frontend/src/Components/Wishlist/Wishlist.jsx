import React, { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../../services/wishlist";
import "./Wishlist.css";
import { backend_url } from "../../config";


const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      // Refresh wishlist after removing
      setWishlist(wishlist.filter(item => item._id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  if (loading) {
    return <div className="wishlist-container"><h2>Loading...</h2></div>;
  }

  if (!wishlist.length) {
    return (
      <div className="wishlist-container">
        <h2>Your wishlist is empty</h2>
        <p>Add items to your wishlist to see them here!</p>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h2>My Wishlist ❤️</h2>

      <div className="wishlist-grid">
        {wishlist.map(product => (
          <div key={product._id} className="wishlist-item">
            <img src={`${backend_url}${product.image}`} alt={product.name} />
            <div className="wishlist-item-details">
              <p className="product-name">{product.name}</p>
              <p className="product-price">₹{product.new_price}</p>
              <button 
                className="remove-btn" 
                onClick={() => handleRemove(product._id)}
              >
                Remove from Wishlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
