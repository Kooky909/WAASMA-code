import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

function Login() {

  const [userEmail, setEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const navigate = useNavigate();

  // Take user and password and send it to the backend
  // Receive an authorized or not authorized
  // *** no functionality now, submit takes you to home ***
  const onSubmit = async (e) => {    
    e.preventDefault()

    const data = {
      userEmail,
      userPassword
    }
    const url = `http://127.0.0.1:5000/user_authen/`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
    const response = await fetch(url, options)
    if (response.status !== 201 && response.status !== 200) {
      const data = await response.json()
      alert(data.message)
    } else {
      const data = await response.json()
      if ( data.success === true) {
        console.log(data.message)
        navigate("/home");
      } else {
        console.log(data.message)
      }
    }
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <h3 className="login-title">LOGIN</h3>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email:</label>
        <input
          className="form-input"
          type="text"
          id="email"
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
      </div>
      <button className="form-button" type="submit">Login</button>
    </form>
  );
};

export default Login;
