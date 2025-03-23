import { useState } from "react";

const ChangeRangeForm = ({ sensorChange = {}, updateCallback }) => {
  const [range_low, setRangeLow] = useState(sensorChange.range_low || "");
  const [range_high, setRangeHigh] = useState(sensorChange.range_high || "");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!range_low || !range_high) {
      setMessage("Please fill in both range fields.");
      setMessageType("error");
      return;
    }

    const data = {
      data: [
        {
          tankId: sensorChange.tank, // Assuming sensorChange has tank info
          sensors: [
            {
              type: sensorChange.type, // Assuming sensorChange has type info
              coms: sensorChange.coms, // Assuming sensorChange has coms info
              low: range_low,
              high: range_high,
            },
          ],
        },
      ],
    };

    const url = "http://127.0.0.1:5000/change_range"; // Removed the :id, as backend doesn't use it
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
                <label htmlFor="range_low">Range-low:</label>
                <input
                    type="text"
                    id="range_low"
                    value={range_low}
                    onChange={(e) => setRangeLow(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="range_high">Range-high:</label>
                <input
                    type="text"
                    id="range_high"
                    value={range_high}
                    onChange={(e) => setRangeHigh(e.target.value)}
                />
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