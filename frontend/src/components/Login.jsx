import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

function Login() {

  const [userEmail, setEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Take user and password and send it to the backend
  // Receive an authorized or not authorized
  // *** no functionality now, submit takes you to home ***
  const onSubmit = async (e) => {    
    e.preventDefault()
    setErrorMessage("");

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
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (response.status !== 200) {
          setErrorMessage(result.message || "Invalid email or password.");
      } else {
          if (result.success) {
              console.log("Login Successful:", result.message);

              // Store user role in localStorage
              if(result.user){
                  localStorage.setItem("userRole", result.user.role);

                  // Navigate based on the role
                  if (result.user.role === "admin") {
                      navigate("/Home");
                  } else if (result.user.role === "operator") {
                      navigate("/operator-dashboard");
                  } else if (result.user.role === "observer") {
                      navigate("/observer-dashboard");
                  } else {
                      setErrorMessage("Unknown role. Contact admin");
                  }
              } else {
                  setErrorMessage("User data missing from response.");
            }

          } else {
              setErrorMessage(result.message || "Invalid credentials.");
          }
        }
    } catch (error) {
      setErrorMessage("Network error or server unavailable. Please try again later.");
      console.error("Login Error:", error);
    }
    

      /*if (response.status !== 200 && response.status !== 201) {
        setErrorMessage(result.message || "Invalid email or password.");
      } else {
        if (result.success) {
          console.log(result.message);
          navigate("/home");
        } else {
          setErrorMessage(result.message || "Invalid credentials.");
        }
      }
    } catch (error) {
      setErrorMessage("Incorrect Email or Password. Please try again.");
      console.error("Login error:", error);
    } */
    
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
