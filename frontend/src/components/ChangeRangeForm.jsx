import { useState } from "react";

const ChangeRangeForm = ({ sensorChange = {}, updateCallback }) => {
  const [CO2_range_low, setCO2RangeLow] = useState(sensorChange.measures.CO2.range_low || "");
  const [CO2_range_high, setCO2RangeHigh] = useState(sensorChange.measures.CO2.range_high || "");
  const [DO_range_low, setDORangeLow] = useState(sensorChange.measures.DO.range_low || "");
  const [DO_range_high, setDORangeHigh] = useState(sensorChange.measures.DO.range_high || "");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!CO2_range_low || !CO2_range_high || !DO_range_low || !DO_range_high) {
      setMessage("Please fill in both range fields.");
      setMessageType("error");
      return;
    }

    const data = {
      CO2_range_low,
      CO2_range_high,
      DO_range_low,
      DO_range_high
    }

    const url = `http://127.0.0.1:5000/change_range/${sensorChange._id}`;
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          window.location.href = '/';
        } else if (response.status === 403) {
          alert('You do not have permission to access this resource.');
        } else {
          // Other errors, like 500, etc.
          alert('Something went wrong. Please try again later.');
          const responseData = await response.json();
          setMessage(responseData.message || "Failed to change range.");
          setMessageType("error");
        }
      } else {
        setMessage("Range successfully updated.");
        setMessageType("success");
        updateCallback();
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
      setMessageType("error");
      console.error("Change range error:", error);
    }
  };


    return (
        <form onSubmit={onSubmit}>
          <table>
            <tbody>
          <div>
            <tr><label htmlFor="CO2">CO2 Range:</label></tr>
            <tr>
              
              <div>
                <td><label htmlFor="range_low">Low:</label></td>
                <td><input
                  type="text"
                  id="CO2_range_low"
                  value={CO2_range_low}
                  onChange={(e) => setCO2RangeLow(e.target.value)}
                /></td>
                </div>
                <div>
                <td><label htmlFor="range_high">High:</label></td>
                <td><input
                    type="text"
                    id="CO2_range_high"
                    value={CO2_range_high}
                    onChange={(e) => setCO2RangeHigh(e.target.value)}
                  /></td>
                </div>
                </tr>
          </div>
          <div>
          <tr><label htmlFor="DO">DO Range:</label></tr>
          <tr>
              <div>
                <td><label htmlFor="range_low">Low:</label></td>
                <td><input
                  type="text"
                  id="DO_range_low"
                  value={DO_range_low}
                  onChange={(e) => setDORangeLow(e.target.value)}
                /></td>
              </div>
              <div>
              <td><label htmlFor="range_high">High:</label></td>
              <td><input
                  type="text"
                  id="DO_range_high"
                  value={DO_range_high}
                  onChange={(e) => setDORangeHigh(e.target.value)}
                /></td>
              </div>
            </tr>  
          </div>
          <tr>
            <button type="submit">{"Update"}</button>
            {message && (
                <p style = {{ color: messageType === "error" ? "red" : "green"}}>
                    {message}
                </p>
            )}</tr>
            </tbody>
          </table>
        </form>
    );
};

export default ChangeRangeForm