import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend,
  LineElement, PointElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChangeRangeForm from "./ChangeRangeForm";

// Register necessary components in Chart.js
ChartJS.register(
  CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, LineElement, PointElement
);

const SensorDisplay = ( inputSensor ) => {
  // Initialize the state for chart data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sensor, setSensor] = useState({});
  const [sensorValue, setSensorValue] = useState({});
  const [sensorData, setSensorData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sensor Data',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        lineTension: 0.4,
      },
    ],
  });

  const fetchSensorData = async () => {
    try {
        const response = await fetch("http://127.0.0.1:5000/current_sensor_data");
            const data = await response.json();

            // Format the sensors to extract the ID correctly
            /*const formattedSensors = data.sensors.map(sensor => ({
                ...sensor,
                _id: sensor._id.$oid // Extract the ID as a string
            }));
            console.log(formattedSensors);
            formatAndSortSensors(formattedSensors);*/
            setSensorValue(data['current-measurement']);
            
            setSensorData((prevData) => {
                const newLabels = [...prevData.labels];
                const newData = [...prevData.datasets[0].data];
          
                // Add a new timestamp (current time) and a random data point
                const newTime = new Date(); // Current time as label
                const newValue = data['current-measurement'];
          
                newLabels.push(newTime);
                newData.push(newValue);
          
                // Keep only the latest 10 data points to avoid overcrowding the chart
                if (newLabels.length > 10) {
                  newLabels.shift();
                  newData.shift();
                }
          
                return {
                  labels: newLabels,
                  datasets: [{ ...prevData.datasets[0], data: newData }],
                };
            });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
  };

  // Update the chart data every second
  useEffect(() => {
    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 3000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Waited 2 seconds!");
      setSensor(inputSensor['inputSensor']);
    }, 2000); // 2 seconds

    // Cleanup the timer on unmount
    return () => clearTimeout(timer);
  }, []);

  const openEditModal = () => {
    if (isModalOpen) return
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const onUpdate = () => {
    closeModal()
    fetchSensorData()
  }

  return (
    <div>
      <h2>{sensor.type} Sensor Data</h2>
      <table>
            <thead>
                <tr>
                    <th>Current Sensor Value  </th>
                    <th>Data Graph  </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{sensorValue.currentMeasurement || 'Loading...'}</td>
                    <td>
                        <Line
                            data={sensorData}
                            options={{
                            scales: {
                                x: {
                                type: 'time',
                                time: {
                                    unit: 'second', // Set the time unit for the x-axis
                                },
                                },
                                y: {
                                beginAtZero: true, // Start the y-axis at zero
                                },
                            },
                            animation: false, // Disable animation for smoother updates
                            }}
                            width={300}
                            height={150}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
        <button onClick={() => openEditModal(sensor)}>Change Range</button>
        {isModalOpen && (
            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModal}>&times;</span>
                    {/* Pass selectedSensor data to the form */}
                    <ChangeRangeForm sensorChange={sensor} updateCallback={onUpdate} />
                </div>
            </div>
        )}
    </div>
  );
}

export default SensorDisplay;