import { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend,
    LineElement, PointElement, Filler } from 'chart.js';
import './AnalysisTool.css';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, Filler);
function Analysis() {
  let isFetching = false;
  const [selectedTank, setSelectedTank] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchFilteredData( "all", "all", "0")
  }, []);

  const fetchFilteredData = async (selectedTank, selectedSensor, selectedTime) => {
    if (isFetching) return; // Prevent multiple fetches at the same time
    isFetching = true;
    try {
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
      const sensorData = await response.json();
      const newData = sensorData.sensor_data;
      
      setChartData({
        datasets: Object.keys(newData).map((sensor, index) => ({
            label: `Sensor ${index + 1}`,
            data: newData[sensor].map((entry) => { 
              const timestamp = new Date(entry.time.$date).getTime();
              return {
                x: timestamp, 
                y: entry.value
              };
            }),
            borderColor: `hsl(${index * 60}, 70%, 50%, 0.7)`,
            backgroundColor: `hsl(${index * 60}, 70%, 80%, 0.7)`,
            fill: true,
            lineTension: 0.4,
        }))
      });
      /*if (response.status !== 201 && response.status !== 200) {
      const data = await response.json()
      alert(data.message)
      }*/
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      isFetching = false; // Fetch is complete
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault()
    fetchFilteredData(selectedTank, selectedSensor, selectedTime)
  }

  return (
    <div className="analysis-container"> 
      <header className="analysis-header">
        <h1>Analysis Tool</h1>
      </header>
  
      <form onSubmit={onSubmit} className="filter-bar">
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="tankSelect">Select Tanks:</label>
            <select id="tankSelect" value={selectedTank} onChange={(e) => setSelectedTank(e.target.value)}>
              <option value="all">Select Tanks</option>
              <option value="1">Tank 1</option>
              <option value="2">Tank 2</option>
              <option value="all">All Tanks</option>
            </select>
          </div>
  
          <div className="filter-item">
            <label htmlFor="sensorSelect">Select Sensors:</label>
            <select id="sensorSelect" value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
              <option value="all">Select Sensors</option>
              <option value="Water">Water Quality</option>
              <option value="Air">Air Quality</option>
              <option value="Pressure">Pressure</option>
              <option value="all">All Sensors</option>
            </select>
          </div>
  
          <div className="filter-item">
            <label htmlFor="timeSelect">Select Time:</label>
            <select id="timeSelect" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
              <option value="0">Select Time</option>
              <option value="1">Last Hour</option>
              <option value="24">Last 24 Hours</option>
              <option value="168">Last 7 Days</option>
              <option value="336">Last 14 Days</option>
              <option value="0">All Data</option>
            </select>
          </div>
  
          <button type="submit" className="apply-button">Apply Filters</button>
        </div>
      </form>
  
      <div className="chart">
        <Line
          data={chartData}
          options={{
            scales: {
              x: {
                type: 'time',
                title: { display: true, text: 'Time' },
                time: {
                  unit: 'minute', // Set the time unit for the x-axis
                  stepSize: 100,  // 100 minutes
                },
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Value' },
              },
            },
            plugins: {
              legend: { display: true },
            },
            animation: false,
          }}
        />
        <p>Ratio of CO2 in water to CO2 in air:</p>
      </div>
    </div>
  );
}

export default Analysis;
