import React, { useState, useEffect } from "react"; // Added hooks
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Shop from "./Pages/Shop";
import Cart from "./Pages/Cart";
import Product from "./Pages/Product";
import Footer from "./Components/Footer/Footer";
import ShopCategory from "./Pages/ShopCategory";
import LoginSignup from "./Pages/LoginSignup";

// ✅ Newly added / fixed imports
import Orders from "./Pages/Orders";
import ResetPassword from "./Pages/ResetPassword";
import ProtectedRoute from "./Components/ProtectedRoute";
import ChatWidget from "./Components/ChatWidget/ChatWidget";

// ✅ Assets
import women_banner from "./Components/Assets/banner_women.png";
import men_banner from "./Components/Assets/banner_mens.png";
import kid_banner from "./Components/Assets/banner_kids.png";

// ✅ Constants
export const backend_url = "http://localhost:4000";
export const currency = "₹";

function App() {
  // Theme state logic
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Router>
      {/* Pass theme props to Navbar */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <Routes>
        <Route path="/" element={<Shop gender="all" />} />
        <Route
          path="/mens"
          element={<ShopCategory banner={men_banner} category="men" />}
        />
        <Route
          path="/womens"
          element={<ShopCategory banner={women_banner} category="women" />}
        />
        <Route
          path="/kids"
          element={<ShopCategory banner={kid_banner} category="kid" />}
        />

        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<LoginSignup />} />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
      </Routes>

      <Footer />
      <ChatWidget />
    </Router>
  );
}

export default App;