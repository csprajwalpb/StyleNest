const API = "http://localhost:4000/api/wishlist";

export const addToWishlist = async (productId) => {
  return fetch(`${API}/add/${productId}`, {
    method: "POST",
    headers: {
      "auth-token": localStorage.getItem("auth-token")
    }
  });
};

export const removeFromWishlist = async (productId) => {
  return fetch(`${API}/remove/${productId}`, {
    method: "DELETE",
    headers: {
      "auth-token": localStorage.getItem("auth-token")
    }
  });
};

export const getWishlist = async () => {
  const res = await fetch(API, {
    headers: {
      "auth-token": localStorage.getItem("auth-token")
    }
  });
  return res.json();
};
