import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [state, setState] = useState("Login"); // Login | Sign Up | Forgot
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    let dataObj;
    await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        Accept: "application/form-data",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => (dataObj = data));

    if (dataObj.success) {
      localStorage.setItem("auth-token", dataObj.token);
      window.location.replace("/");
    } else {
      alert(dataObj.errors);
    }
  };

  const signup = async () => {
    let dataObj;
    await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: {
        Accept: "application/form-data",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => (dataObj = data));

    if (dataObj.success) {
      localStorage.setItem("auth-token", dataObj.token);
      window.location.replace("/");
    } else {
      alert(dataObj.errors);
    }
  };

  const forgotPassword = async () => {
    await fetch("http://localhost:4000/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email }),
    });

    alert("If account exists, reset link has been sent.");
    setState("Login");
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>
          {state === "Login"
            ? "Login"
            : state === "Sign Up"
            ? "Sign Up"
            : "Forgot Password"}
        </h1>

        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <input
              type="text"
              placeholder="Your name"
              name="username"
              value={formData.username}
              onChange={changeHandler}
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />

          {(state === "Login" || state === "Sign Up") && (
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={changeHandler}
            />
          )}
        </div>

        {state === "Login" && (
          <p className="forgot-password" onClick={() => setState("Forgot")}>
            Forgot Password?
          </p>
        )}

        <button
          onClick={() => {
            if (state === "Login") login();
            else if (state === "Sign Up") signup();
            else forgotPassword();
          }}
        >
          {state === "Forgot" ? "Send Reset Link" : "Continue"}
        </button>

        {state === "Login" && (
          <p className="loginsignup-login">
            Create an account?{" "}
            <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        )}

        {state === "Sign Up" && (
          <p className="loginsignup-login">
            Already have an account?{" "}
            <span onClick={() => setState("Login")}>Login here</span>
          </p>
        )}

        {state === "Forgot" && (
          <p className="loginsignup-login">
            <span onClick={() => setState("Login")}>← Back to Login</span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
