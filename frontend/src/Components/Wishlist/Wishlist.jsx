import React, { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../services/wishlist";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    getWishlist().then(data => setWishlist(data));
  }, []);

  if (!wishlist.length) {
    return <h2>Your wishlist is empty</h2>;
  }

  return (
    <div>
      <h2>My Wishlist ❤️</h2>

      {wishlist.map(product => (
        <div key={product._id}>
          <img src={`http://localhost:4000${product.image}`} width="80" />
          <p>{product.name}</p>
          <p>₹{product.price}</p>

          <button onClick={() => removeFromWishlist(product._id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default Wishlist;
