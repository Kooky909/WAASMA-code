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
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(url, options);
      if (response.status !== 201 && response.status !== 200) {
        const responseData = await response.json();
        setMessage(responseData.message || "Failed to change range.");
        setMessageType("error");
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
          <div>
            <label htmlFor="CO2">CO2 Range:</label>
              <div>
                <label htmlFor="range_low">Low:</label>
                <input
                  type="text"
                  id="CO2_range_low"
                  value={CO2_range_low}
                  onChange={(e) => setCO2RangeLow(e.target.value)}
                />
                </div>
                <div>
                  <label htmlFor="range_high">High:</label>
                  <input
                    type="text"
                    id="CO2_range_high"
                    value={CO2_range_high}
                    onChange={(e) => setCO2RangeHigh(e.target.value)}
                  />
                </div>
          </div>
          <div>
            <label htmlFor="CO2">DO Range:</label>
              <div>
                <label htmlFor="range_low">Low:</label>
                <input
                  type="text"
                  id="DO_range_low"
                  value={DO_range_low}
                  onChange={(e) => setDORangeLow(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="range_high">High:</label>
                <input
                  type="text"
                  id="DO_range_high"
                  value={DO_range_high}
                  onChange={(e) => setDORangeHigh(e.target.value)}
                />
              </div>
          </div>

            <button type="submit">{"Update"}</button>
            {message && (
                <p style = {{ color: messageType === "error" ? "red" : "green"}}>
                    {message}
                </p>
            )}
        </form>
    );
};

export default ChangeRangeForm