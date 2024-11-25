import { useState, useEffect } from "react";

const ConfigSensorsForm = ({ activeTab = {}, updateCallback }) => {

    const [sensors, setSensors] = useState([]);
    const [low, setRangeLow] = useState([]);
    const [high, setRangeHigh] = useState([]);
    const [coms, setComs] = useState([]);
    const numTanks = 2;
    const numSensors = 3;

    useEffect(() => {
        fetchSensorConfig()
        formatAndSortSensors(sensors)
    }, []);

    const fetchSensorConfig = async () => {
        const response = await fetch("http://127.0.0.1:5000/sensors");
        const data = await response.json();

        // Format the sensors to extract the ID correctly
        const formattedSensors = data.sensors.map(sensor => ({
            ...sensor,
            _id: sensor._id.$oid // Extract the ID as a string
        }));
        console.log(formattedSensors);
        formatAndSortSensors(formattedSensors);
    };

    const formatAndSortSensors = (sensors) => {
        // Sort the sensors by tank and sensor type in the desired order
        const orderedSensors = sensors.sort((a, b) => {
            // Sort by tankId first, then by predefined sensor type order
            const typeOrder = { water: 0, air: 1, pressure: 2 };  // Define the order of sensor types
            
            if (a.tankId === b.tankId) {
                return typeOrder[a.sensorType] - typeOrder[b.sensorType]; // Order by sensor type
            }
            return a.tankId - b.tankId; // Order by tankId if sensor types are the same
        });
        console.log(orderedSensors);
        console.log(orderedSensors[0]);
        setSensors(orderedSensors);
    };

    const handleNumTanksChange = (numTanks) => {
        console.log(numTanks);
      };

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            range
        }
        console.log(data)
        const url = `http://127.0.0.1:5000/change_range/${sensorChange._id}`;
        const options = {
            method: "PATCH",
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
            updateCallback()
        }
    }


    return (
        <form onSubmit={onSubmit}>
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
            {[...Array(numTanks)].map((_, tankIndex) => {
                const tankId = tankIndex + 1;
                return (
                    <div className="tank-config" key={tankId}>
                        <h3>{`Tank ${tankId}`}</h3>

                        {/* Render each sensor configuration inside the tank */}
                        {[...Array(numSensors)].map((_, sensorIndex) => {
                            const sensorId = sensorIndex + 1; // Unique sensor ID for each sensor in a tank

                            return (
                                <div key={sensorId} className="sensor-inputs">
                                    <h4>{`${sensors[sensorId]} Sensor`}</h4>

                                    {/* Render the communication, range low, and range high inputs */}
                                    <label htmlFor={`coms-${tankId}-${sensorId}`}>Communication:</label>
                                    <input
                                        type="text"
                                        id={`coms-${tankId}-${sensorId}`}
                                        value={coms}
                                        onChange={(e) => setComs(e.target.value)}
                                    />

                                    <label htmlFor={`low-${tankId}-${sensorId}`}>Range - Low:</label>
                                    <input
                                        type="number"
                                        id={`low-${tankId}-${sensorId}`}
                                        value={low}
                                        onChange={(e) => setRangeLow(e.target.value)}
                                    />

                                    <label htmlFor={`high-${tankId}-${sensorId}`}>Range - High:</label>
                                    <input
                                        type="number"
                                        id={`high-${tankId}-${sensorId}`}
                                        value={high}
                                        onChange={(e) => setRangeHigh(e.target.value)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            <br />
            <button type="submit">Submit</button>
        </form>
    );
};

export default ConfigSensorsForm