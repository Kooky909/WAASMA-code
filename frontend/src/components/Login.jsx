import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  // Take user and password and send it to the backend
  // Receive an authorized or not authorized
  // *** no functionality now, submit takes you to home ***
  const onSubmit = async (e) => {
    
    navigate("/home");
    
    //e.preventDefault()

    //const data = {
    //  email
    //}
    //const url = `http://127.0.0.1:5000/change_setting/${settingChange._id}`;
    //const options = {
    //  method: "PATCH",
    //  headers: {
    //    "Content-Type": "application/json"
    //  },
    //  body: JSON.stringify(data)
    //}
    //const response = await fetch(url, options)
    //if (response.status !== 201 && response.status !== 200) {
    //  const data = await response.json()
    //  alert(data.message)
    //} else {
    //  updateCallback()
    //}
  }

  return (
    <form onSubmit={onSubmit}>
      <h3>LOGIN!!!!</h3>
      <div>
        <label htmlFor="user-email">Email:</label>
        <input
          type="text"
          id="user-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="user-pw">Password:</label>
        <input
          type="text"
          id="user-pw"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Login</button>
    </form>
    );
};

export default Login;