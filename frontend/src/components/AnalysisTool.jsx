import { useState } from "react";
import RealTimeChart from "./RealTimeChart";

const AnalysisTool = () => {

    /*useEffect(() => {
        fetchData()
      }, []);

    const fetchData = async () => {
        const response = await fetch("http://127.0.0.1:5000/sensors");
        const data = await response.json();
    
        // Format the sensors to extract the ID correctly
        const formattedSensors = data.sensors.map(sensor => ({
            ...sensor,
            _id: sensor._id.$oid // Extract the ID as a string
        }));
        console.log(formattedSensors);
        setSensors(formattedSensors);
      };*/

    const [selectedTank, setSelectedTank] = useState('');
    const [selectedSensor, setSelectedSensor] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            selectedTank,
            selectedSensor,
            selectedTime
        }
        console.log(data)
        const url = `http://127.0.0.1:5000/analysis_query/`;
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        const sensor_data = await response.json();
        console.log(sensor_data);
        /*if (response.status !== 201 && response.status !== 200) {
            const data = await response.json()
            alert(data.message)
        }*/
    }


    return (
        <>
        <h2>Analysis Tool</h2>
        <form onSubmit={onSubmit} className="filter-bar">
            <div>
                <label htmlFor="tankSelect">Select Tanks:</label>
                <select id="tankSelect" value={selectedTank} onChange={(e) => setSelectedTank(e.target.value)}>
                    <option value="">Select Tanks</option>
                    <option value="1">Tank 1</option>
                    <option value="2">Tank 2</option>
                    <option value="both">All Tanks</option>
                </select>
            </div>

            <div>
                <label htmlFor="sensorSelect">Select Sensors:</label>
                <select id="sensorSelect" value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
                    <option value="">Select Sensors</option>
                    <option value="Water">Water Quality</option>
                    <option value="Air">Air Quality</option>
                    <option value="Pressure">Pressure</option>
                    <option value="all">All Sensors</option>
                </select>
            </div>

            <div>
                <label htmlFor="timeSelect">Select Time:</label>
                <select id="timeSelect" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                    <option value="">Select Time</option>
                    <option value="lastHour">Last Hour</option>
                    <option value="last24Hours">Last 24 Hours</option>
                    <option value="last7Days">Last 7 Days</option>
                    <option value="last30Days">Last 14 Days</option>
                </select>
            </div>

            <button type="submit">Apply Filters</button>
        </form>
        <div class="chart">
            <RealTimeChart/>
            <p>Ratio of CO2 in water to CO2 in air:</p>
        </div>
        </> 
    );
};

export default AnalysisTool