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
  const [selectedMeasure, setSelectedMeasure] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [sensorData, setSensorData] = useState([]);
  const [dataRatios, setDataRatios] = useState({});

  useEffect(() => {
    setSelectedTank("all");
    setSelectedSensor("all");
    setSelectedSensor("all");
    fetchFilteredData( "all", "all", "all", "0", "0");
  }, []);

  const fetchFilteredData = async (selectedTank, selectedSensor, selectedMeasure, formattedStart, formattedEnd) => {
    if (isFetching) return; // Prevent multiple fetches at the same time
    isFetching = true;
    try {
      const data = {
        selectedTank,
        selectedSensor,
        selectedMeasure,
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
      calculateRatios( newData );
      
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
    fetchFilteredData(selectedTank, selectedSensor, selectedMeasure, formattedStart, formattedEnd)
  }

  function calculateRatios( sensorData ) {
    // Dynamically extract values for each sensor type
    const sensorValues = {};
    for (let sensor in sensorData) {
      // For each sensor, extract the values and store them in sensorValues object
      sensorValues[sensor] = sensorData[sensor].map(entry => entry.value);
    }
    // Calculate the average
    const sensorAverages = {};
    for (let sensor in sensorValues) {
      sensorAverages[sensor] = calculateAverage(sensorValues[sensor]);
    }
    // Calculate and set the ratios
    const ratios = {};
    for (let sensor1 in sensorAverages) {
      for (let sensor2 in sensorAverages) {
        if (sensor1 != sensor2 && sensor1.slice(0, -4) == sensor2.slice(0, -3)) {
          ratios[sensor1.slice(0, -4)] = sensorAverages[sensor1] / sensorAverages[sensor2]
        }
      }
    }
    setDataRatios(ratios);
  }

  // Function to calculate the average value from an array of objects with `value` properties
  const calculateAverage = (arr) => {
    if (arr.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum = sum + arr[i];
    }
    return sum / arr.length;
  };

  function convertToCSV(flatData) {
    /*const header = Object.keys(data[0]).join(",");  // Extracts the header from the first object
    const rows = data.map(item => Object.values(item).join(",")); // Maps data to CSV rows
    return [header, ...rows].join("\n"); // Combine the header with rows*/

    // Round time to the second
    const roundToSecond = (timestamp) => {
      return new Date(Math.floor(new Date(timestamp).getTime() / 1000) * 1000);
    };

    // Create a dictionary where the key is the rounded time and the value is an object with sensor values
    const groupedData = {};
    flatData.forEach(entry => {
      const roundedTime = roundToSecond(entry.time).toISOString();
      
      // If the time doesn't exist in the dictionary, create a new object for that time
      if (!groupedData[roundedTime]) {
        groupedData[roundedTime] = {};
      }

      // Add the sensor value for the current time
      groupedData[roundedTime][entry.name] = entry.value;
    });

    // Now, create the CSV rows
    const headers = ['time', ...new Set(flatData.map(entry => entry.name))];  // Unique sensor names
    const rows = [];

    // For each unique time, create a row in the CSV
    Object.keys(groupedData).forEach(time => {
      const row = [time];
      headers.slice(1).forEach(sensorName => {
        row.push(groupedData[time][sensorName] || ''); // Add value or empty if no data
      });
      rows.push(row);
    });

    // Convert to CSV format
    const csv = [
      headers.join(','), // Add the header row
      ...rows.map(row => row.join(',')) // Add each data row
    ].join('\n');

    return csv;
  }

  const downloadCSV = () => {
    if (!chartData || chartData.length === 0) {
      alert("No data available to download.");
      return;
    }
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
    console.log(flatData)
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
            <label htmlFor="tankSelect">Select Tank:</label>
            <select id="tankSelect" value={selectedTank} onChange={(e) => setSelectedTank(e.target.value)}>
              <option value="all">All Tanks</option>
              <option value="1">Tank 1</option>
              <option value="2">Tank 2</option>
            </select>
          </div>
  
          <div className="filter-item">
            <label htmlFor="sensorSelect">Select Sensor:</label>
            <select id="sensorSelect" value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
              <option value="all">All Sensors</option>
              <option value="water">Water Quality</option>
              <option value="air">Air Quality</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="measureSelect">Select Measure:</label>
            <select id="measureSelect" value={selectedMeasure} onChange={(e) => setSelectedMeasure(e.target.value)}>
              <option value="all">All Measures</option>
              <option value="CO2">CO2</option>
              <option value="DO">DO</option>
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
              placeholderText="Select a date"
            />
          </div>
  
          <button type="submit" className="apply-button">
            Apply Filters</button>
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
        <p>Ratio of CO2 to O2:</p>
        <div>
          {Object.entries(dataRatios).map(([ratio, value]) => (
            <div>
              <h3>{ratio}</h3>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analysis;
