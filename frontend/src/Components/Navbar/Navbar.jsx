import React, { useContext, useRef, useState } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown.png';

const Navbar = ({ theme, toggleTheme }) => {
  // State to track the active menu item
  let [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const token = localStorage.getItem("auth-token");

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  return (
    <div className='nav'>
      {/* Clicking logo resets menu to shop */}
      <Link to='/' onClick={() => { setMenu("shop") }} style={{ textDecoration: 'none' }} className="nav-logo">
        <img src={logo} alt="logo" />
        <p>StyleNest</p>
      </Link>

      {/* Dropdown icon - visible only on mobile via CSS */}
      <img onClick={dropdown_toggle} className='nav-dropdown' src={nav_dropdown} alt="menu toggle" />

      {/* Navigation Links */}
      <ul ref={menuRef} className="nav-menu">
        {/* Add 'active' class based on state. The <hr> is always present but controlled by CSS */}
        <li className={menu === "shop" ? "active" : ""} onClick={() => { setMenu("shop") }}>
          <Link to='/' style={{ textDecoration: 'none' }}>Shop</Link>
          <hr />
        </li>
        <li className={menu === "mens" ? "active" : ""} onClick={() => { setMenu("mens") }}>
          <Link to='/mens' style={{ textDecoration: 'none' }}>Men</Link>
          <hr />
        </li>
        <li className={menu === "womens" ? "active" : ""} onClick={() => { setMenu("womens") }}>
          <Link to='/womens' style={{ textDecoration: 'none' }}>Women</Link>
          <hr />
        </li>
        <li className={menu === "kids" ? "active" : ""} onClick={() => { setMenu("kids") }}>
          <Link to='/kids' style={{ textDecoration: 'none' }}>Kids</Link>
          <hr />
        </li>
      </ul>

      <div className="nav-login-cart">
        {/* Dark Mode Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn" 
          style={{ cursor: 'pointer', padding: '8px 15px', borderRadius: '20px' }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {localStorage.getItem('auth-token')
          ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace("/"); }}>Logout</button>
          : <Link to='/login' style={{ textDecoration: 'none' }}><button>Login</button></Link>}

        {token && (
          <Link to="/orders" style={{ textDecoration: "none" }}>
            <button>My Orders</button>
          </Link>
        )}

        <div className="nav-cart-container">
            <Link to="/cart"><img src={cart_icon} alt="cart" /></Link>
            <div className="nav-cart-count">{getTotalCartItems()}</div>
        </div>
      </div>
    </div>
  )
}

export default Navbar;