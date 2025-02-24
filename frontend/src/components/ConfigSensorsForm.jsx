import { useState, useEffect } from "react";
import './ConfigSensorsForm.css';

const ConfigSensorsForm = ({ updateCallback }) => {
  const [numTanks, setNumTanks] = useState(2); // Default to 2 tanks
  const [sensorConfig, setSensorConfig] = useState([]); // Stores config for each sensor in each tank

  useEffect(() => {
    initializeSensorConfig(numTanks);
  }, [numTanks]);

  // Initialize sensor config for the number of tanks
  const initializeSensorConfig = (numTanks) => {
    const newConfig = [];
    for (let i = 0; i < numTanks; i++) {
      newConfig.push({
        water: { coms: "", low: "", high: "" },
        pressure: { coms: "", low: "", high: "" },
        air: { coms: "", low: "", high: "" }
      });
    }
    setSensorConfig(newConfig);
  };

  const handleNumTanksChange = (e) => {
    const newNumTanks = parseInt(e.target.value);
    setNumTanks(newNumTanks);
  };

  const handleInputChange = (tankIndex, sensorType, field, value) => {
    const updatedConfig = [...sensorConfig];
    updatedConfig[tankIndex][sensorType][field] = value;
    setSensorConfig(updatedConfig);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to send in the request
    const data = sensorConfig.map((tankConfig, tankIndex) => ({
      tankId: tankIndex + 1,
      sensors: [
        {
          type: "water",
          coms: tankConfig.water.coms,
          low: tankConfig.water.low,
          high: tankConfig.water.high
        },
        {
          type: "pressure",
          coms: tankConfig.pressure.coms,
          low: tankConfig.pressure.low,
          high: tankConfig.pressure.high
        },
        {
          type: "air",
          coms: tankConfig.air.coms,
          low: tankConfig.air.low,
          high: tankConfig.air.high
        }
      ]
    }));

    // Assuming an endpoint that accepts the sensor configuration
    const url = `http://127.0.0.1:5000/change_range`;
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data })
    };

    const response = await fetch(url, options);
    if (response.status !== 201 && response.status !== 200) {
      const data = await response.json();
      alert(data.message);
    } else {
      updateCallback(); // Callback function to update UI or state after success
    }
  };

  return (
    <form onSubmit={onSubmit} className="config-sensor-form">
      <div>
        <label htmlFor="numTanks">Enter number of desired tanks:</label>
        <input
          type="number"
          id="numTanks"
          value={numTanks}
          onChange={handleNumTanksChange}
          min="1"
          max="5"
          required
        />
      </div>
      <br />

      {/* Render each tank configuration based on the numTanks value */}
      {[...Array(numTanks)].map((_, tankIndex) => (
        <div className="tank-config" key={tankIndex}>
          <h3>{`Tank ${tankIndex + 1}`}</h3>

          {/* Water sensor configuration */}
          <div className="sensor-inputs">
            <h4>Water Sensor</h4>
            <label htmlFor={`coms-${tankIndex}-water`}>Communication:</label>
            <input
              type="text"
              id={`coms-${tankIndex}-water`}
              value={sensorConfig[tankIndex]?.water.coms || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "water", "coms", e.target.value)
              }
            />
            <br />
            <label htmlFor={`low-${tankIndex}-water`}>Range - Low:</label>
            <input
              type="number"
              id={`low-${tankIndex}-water`}
              value={sensorConfig[tankIndex]?.water.low || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "water", "low", e.target.value)
              }
            />
            <br />
            <label htmlFor={`high-${tankIndex}-water`}>Range - High:</label>
            <input
              type="number"
              id={`high-${tankIndex}-water`}
              value={sensorConfig[tankIndex]?.water.high || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "water", "high", e.target.value)
              }
            />
          </div>

          {/* Pressure sensor configuration */}
          <div className="sensor-inputs">
            <h4>Pressure Sensor</h4>
            <label htmlFor={`coms-${tankIndex}-pressure`}>Communication:</label>
            <input
              type="text"
              id={`coms-${tankIndex}-pressure`}
              value={sensorConfig[tankIndex]?.pressure.coms || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "pressure", "coms", e.target.value)
              }
            />
            <br />
            <label htmlFor={`low-${tankIndex}-pressure`}>Range - Low:</label>
            <input
              type="number"
              id={`low-${tankIndex}-pressure`}
              value={sensorConfig[tankIndex]?.pressure.low || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "pressure", "low", e.target.value)
              }
            />
            <br />
            <label htmlFor={`high-${tankIndex}-pressure`}>Range - High:</label>
            <input
              type="number"
              id={`high-${tankIndex}-pressure`}
              value={sensorConfig[tankIndex]?.pressure.high || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "pressure", "high", e.target.value)
              }
            />
          </div>

          {/* Air sensor configuration */}
          <div className="sensor-inputs">
            <h4>Air Sensor</h4>
            <label htmlFor={`coms-${tankIndex}-air`}>Communication:</label>
            <input
              type="text"
              id={`coms-${tankIndex}-air`}
              value={sensorConfig[tankIndex]?.air.coms || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "air", "coms", e.target.value)
              }
            />
            <br />
            <label htmlFor={`low-${tankIndex}-air`}>Range - Low:</label>
            <input
              type="number"
              id={`low-${tankIndex}-air`}
              value={sensorConfig[tankIndex]?.air.low || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "air", "low", e.target.value)
              }
            />
            <br />
            <label htmlFor={`high-${tankIndex}-air`}>Range - High:</label>
            <input
              type="number"
              id={`high-${tankIndex}-air`}
              value={sensorConfig[tankIndex]?.air.high || ""}
              onChange={(e) =>
                handleInputChange(tankIndex, "air", "high", e.target.value)
              }
            />
          </div>
        </div>
      ))}
      
      <button type="submit">Submit</button>
    </form>
  );
};

export default ConfigSensorsForm;