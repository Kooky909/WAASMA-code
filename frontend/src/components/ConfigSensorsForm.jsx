import { useState, useEffect } from "react";
import './ConfigSensorsForm.css';

const ConfigSensorsForm = ({ onFormSubmit }) => {
  const [numTanks, setNumTanks] = useState(0);
  const [numSensors, setNumSensors] = useState(0);
  const [sensorData, setSensorData] = useState([]); // Stores config for each sensor in each tank
  const [errorMessage, setErrorMessage] = useState('');  // Error message state

  useEffect(() => {
    initializeSensorData(numTanks, numSensors);
  }, [numTanks, numSensors]);

  // Initialize sensor config for the number of tanks and sensors
  const initializeSensorData = (numTanks, numSensors) => {
    const newData = [];
    for (let i = 0; i < numTanks; i++) {
      const tankSensors = [];
      for (let j = 0; j < numSensors; j++) {
        tankSensors.push({
          name: "",
          type: "water",  // Default type
          coms: "",
          low: "",
          high: ""
        });
      }
      newData.push(tankSensors);
    }
    setSensorData(newData);
  };

  const handleNumTanksChange = (e) => {
    const newNumTanks = parseInt(e.target.value);
    setNumTanks(newNumTanks);
  };

  const handleNumSensorsChange = (e) => {
    const newNumSensors = parseInt(e.target.value);
    setNumSensors(newNumSensors);
  };

  const handleInputChange = (tankIndex, sensorType, field, value) => {
    const updatedSensorData = [...sensorData];
    updatedSensorData[tankIndex][sensorType][field] = value;
    setSensorData(updatedSensorData);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clears prev error messages

    // Input Validation ---- IS THIS RIGHT
    /*for (let tankIndex = 0; tankIndex < numTanks; tankIndex++) {
      const tankConfig = sensorConfig[tankIndex];
      if (!tankConfig.water.coms || !tankConfig.water.low || !tankConfig.water.high ||
          !tankConfig.pressure.coms || !tankConfig.pressure.low || !tankConfig.pressure.high ||
          !tankConfig.air.coms || !tankConfig.air.low || !tankConfig.air.high) {
        setErrorMessage("Please fill in all sensor configuration fields.");
        return; // Stop submission if any field is empty
      }
    }*/

    // Prepare the data to send in the request
    const data = sensorData.map((tankConfig, tankIndex) => ({
      tank: tankIndex + 1,  // For example, tank 1, tank 2, etc.
      sensors: tankConfig.map(sensor => ({
        name: sensor.name,
        type: sensor.type,  // e.g., 'water'
        coms: sensor.coms,  // Communication port or identifier
        low: sensor.low,    // Low range value
        high: sensor.high   // High range value
      }))
    }));

    const url = `http://127.0.0.1:5000/config_sensors`;
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data })
    };

    try {
      const response = await fetch(url, options);
      if (response.status !== 201 && response.status !== 200) {
        const responseData = await response.json();
        setErrorMessage(responseData.message || "Failed to configure sensors."); // Needs backend message or generic error
      } else {
      onFormSubmit(); // Callback function to update UI or state after success
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Config sensor error:", error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="config-sensor-form">
      <div>
          <h2> Configure Sensors </h2>
          <p> You must configure sensors to begin system run.</p>
      </div>
      <br />

      <div>
        <label htmlFor="numTanks">Enter number of desired tanks:</label>
        <input
          type="number"
          id="numTanks"
          value={numTanks}
          onChange={handleNumTanksChange}
          min="1"
          max="2"
          required
        />
      </div>
      <br />

      <div>
        <label htmlFor="numSensors">Enter number of sensors per tank:</label>
        <input
          type="number"
          id="numSensors"
          value={numSensors}
          onChange={handleNumSensorsChange}
          min="1"
          max="3"
          required
        />
      </div>
      <br />

      {/* Render each tank configuration based on the numTanks value */}
      {[...Array(numTanks)].map((_, tankIndex) => (
        <div className="tank-config" key={tankIndex}>
          <h3>{`Tank ${tankIndex + 1}`}</h3>

          {[...Array(numSensors)].map((_, sensorIndex) => (
            <div className="sensor-config" key={sensorIndex}>
              {/* Sensor configuration fields*/}

              <table>
                <tr>
                  <h4>{`Sensor ${sensorIndex + 1}`}</h4>
                </tr>
                <tr>
                  <td><label htmlFor={`name-${tankIndex}-${sensorIndex}`}> Sensor Name:</label></td>
                  <td><input
                    type="text"
                    id={`name-${tankIndex}-${sensorIndex}`}
                    value={sensorData[tankIndex]?.[sensorIndex]?.name || ""}
                    onChange={(e) =>
                      handleInputChange(tankIndex, sensorIndex, "name", e.target.value)
                    }
                  />
                  </td>
                </tr>

                <tr>
                  <td><label htmlFor={`type-${tankIndex}-${sensorIndex}`}>Sensor Type:</label></td>
                  <td> <select id={`type-${tankIndex}-${sensorIndex}`}
                  value={sensorData[tankIndex]?.[sensorIndex]?.type}
                  onChange={(e) =>
                    handleInputChange(tankIndex, sensorIndex, "type", e.target.value)
                  }>
                  <option value="water">Water</option>
                  <option value="air">Air</option>
                  <option value="pressure">Pressure</option>
                  </select>
                  </td>
                </tr>

                <tr>
                    <td><label htmlFor={`coms-${tankIndex}-${sensorIndex}`}>Communication:</label></td>
                    <td>  <input
                type="text"
                id={`coms-${tankIndex}-${sensorIndex}`}
                value={sensorData[tankIndex]?.[sensorIndex]?.coms || ""}
                onChange={(e) =>
                  handleInputChange(tankIndex, sensorIndex, "coms", e.target.value)
                }
                /></td>
                </tr>

                <tr>
                  <td><label htmlFor={`low-${tankIndex}-${sensorIndex}`}>Range - Low:</label></td>
                  <td><input
                type="number"
                id={`low-${tankIndex}-${sensorIndex}`}
                value={sensorData[tankIndex]?.[sensorIndex]?.low || ""}
                onChange={(e) =>
                  handleInputChange(tankIndex, sensorIndex, "low", e.target.value)
                }
                /></td>
                </tr>

                <tr>
                  <td><label htmlFor={`high-${tankIndex}-${sensorIndex}`}>Range - High:</label></td>
                  <td><input
                  type="number"
                  id={`high-${tankIndex}-${sensorIndex}`}
                  value={sensorData[tankIndex]?.[sensorIndex]?.high || ""}
                  onChange={(e) =>
                    handleInputChange(tankIndex, sensorIndex, "high", e.target.value)
                  }
                /></td>
                </tr>
              </table>
            </div>
          ))}
          </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default ConfigSensorsForm;