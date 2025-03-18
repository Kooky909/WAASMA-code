import { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import DatePicker from "react-datepicker";
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend,
    LineElement, PointElement, Filler } from 'chart.js';
import './AnalysisTool.css';
import "react-datepicker/dist/react-datepicker.css";

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, Filler);
function Analysis() {
  let isFetching = false;
  const [selectedTank, setSelectedTank] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    setSelectedTank("all");
    setSelectedSensor("all");
    setStartDate("0");
    setEndDate("0");
    fetchFilteredData( "all", "all", "0", "0");
  }, []);

  const fetchFilteredData = async (selectedTank, selectedSensor, formattedStart, formattedEnd) => {
    if (isFetching) return; // Prevent multiple fetches at the same time
    isFetching = true;
    try {
      const data = {
        selectedTank,
        selectedSensor,
        formattedStart,
        formattedEnd
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
      setSensorData(newData);
      
      setChartData({
        datasets: Object.keys(newData).map((sensorName, index) => ({
            label: sensorName,
            data: newData[sensorName].map((entry) => { 
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
    const formattedStart = startDate ? startDate.toISOString() : "0";
    const formattedEnd = endDate ? endDate.toISOString() : "0";
    fetchFilteredData(selectedTank, selectedSensor, formattedStart, formattedEnd)
  }

  function convertToCSV(data) {
    const header = Object.keys(data[0]).join(",");  // Extracts the header from the first object
    const rows = data.map(item => Object.values(item).join(",")); // Maps data to CSV rows
    
    return [header, ...rows].join("\n"); // Combine the header with rows
  }

  const downloadCSV = () => {
    /*if (!chartData || chartData.length === 0) {
      alert("No data available to download.");
      return;
    }*/
  
    console.log(sensorData)
    const flatData = [];
    for (const [sensorName, readings] of Object.entries(sensorData)) {
      readings.forEach(entry => {
        const dateString = entry.time.$date;
        const dateObj = new Date(dateString);
        flatData.push({
          sensor_name: sensorName,
          time: dateObj.toISOString(),
          value: entry.value
        });
      });
    }

    const csvContent = convertToCSV(flatData);
 
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
  
    if (link.download !== undefined) { // Check if the browser supports the download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', "sensor_data.csv");
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
              <option value="all">All Tanks</option>
              <option value="1">Tank 1</option>
              <option value="2">Tank 2</option>
            </select>
          </div>
  
          <div className="filter-item">
            <label htmlFor="sensorSelect">Select Sensors:</label>
            <select id="sensorSelect" value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
              <option value="all">All Sensors</option>
              <option value="Water">Water Quality</option>
              <option value="Air">Air Quality</option>
              <option value="Pressure">Pressure</option>
            </select>
          </div>
  
          <div className="filter-item">
            <label htmlFor="timeSelect">Select Dates:</label>
            <DatePicker
              selected={startDate}
              onChange={(dates) => {
                const [start, end] = dates;
                setStartDate(start);
                setEndDate(end);
              }}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              isClearable
              placeholderText="Select a date range"
            />
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
        <button onClick={() => downloadCSV(chartData)} className="download-CSV">Download Data</button>
        <p>Ratio of CO2 in water to CO2 in air:</p>
      </div>
    </div>
  );
}

export default Analysis;
