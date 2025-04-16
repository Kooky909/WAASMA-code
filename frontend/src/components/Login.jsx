import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

function Login() {

  const [userEmail, setEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Take user and password and send it to the backend
  const onSubmit = async (e) => {    
    e.preventDefault()
    setErrorMessage("");

    const data = {
      userEmail,
      userPassword
    }
    const url = `http://127.0.0.1:5000/login`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result)

      if (response.status !== 200) {
        setErrorMessage(result.message || "Invalid email or password.");
      } else {
        console.log("Login Successful:", result.message);
        const token = result.token;
        localStorage.removeItem("token");
        localStorage.setItem("token", token);

        const decoded = jwtDecode(token);
        console.log(decoded.sub)
        console.log(decoded.role)
        
        if (decoded.role === "admin" || decoded.role === "operator" || decoded.role === "observer") {
          navigate("/Home");
        } else {
          setErrorMessage("Unknown role in token.");
        } 
      }
    } catch (error) {
      setErrorMessage("Network error or server unavailable. Please try again later.");
      console.error("Login Error:", error);
    }
  };

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <h3 className="login-title">LOGIN</h3>

      <div className="form-group">
        <label className="form-label" htmlFor="userEmail">Email:</label>
        <input
          className="form-input"
          type="text"
          id="userEmail"
          value={userEmail}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">Password:</label>
        <input
          className="form-input"
          type="password"
          id="password"
          value={userPassword}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>

      <button className="form-button" type="submit">Login</button>
    </form>
  );
}

export default Login;
