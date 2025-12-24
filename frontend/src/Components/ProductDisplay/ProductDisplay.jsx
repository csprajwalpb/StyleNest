import React, { useContext, useState } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { backend_url, currency } from "../../App";
import { addToWishlist } from "../../services/wishlist";

const ProductDisplay = ({product}) => {

  const {addToCart} = useContext(ShopContext);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);

  const handleAddToWishlist = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      setIsAddingToWishlist(true);
      await addToWishlist(product._id);
      setWishlistAdded(true);
      setShowWishlistPopup(true);
      setTimeout(() => setShowWishlistPopup(false), 3000);
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  return (
    <div className="productdisplay">
      {/* Wishlist Popup */}
      {showWishlistPopup && (
        <div className="wishlist-popup">
          <span>✓ Added to Wishlist!</span>
        </div>
      )}
      
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
          <img src={backend_url + product.image} alt="img" />
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={backend_url + product.image} alt="img" />
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">{currency}{product.old_price}</div>
          <div className="productdisplay-right-price-new">{currency}{product.new_price}</div>
        </div>
        <div className="productdisplay-right-description">
        {product.description}
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <div className="productdisplay-buttons">
          <button 
            className="wishlist-btn" 
            onClick={handleAddToWishlist}
            disabled={wishlistAdded || isAddingToWishlist}
          >
            {isAddingToWishlist ? "⏳ Adding to Wishlist..." : wishlistAdded ? "✓ Added to Wishlist" : "❤️ Add to Wishlist"}
          </button>
          <button onClick={()=>addToCart(product.id)}>ADD TO CART</button>
        </div>
        <p className="productdisplay-right-category"><span>Category :</span> Women, T-shirt, Crop Top</p>
        <p className="productdisplay-right-category"><span>Tags :</span> Modern, Latest</p>
      </div>
    </div>
  );
};

export default ProductDisplay;