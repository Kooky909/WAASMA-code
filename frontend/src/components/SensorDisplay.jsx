import React, { useContext, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend,
  LineElement, PointElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import ChangeRangeForm from "./ChangeRangeForm";
import { WebSocketContext } from "./WebSocketProvider";

// Register necessary components in Chart.js
ChartJS.register(
  CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, LineElement, PointElement
);

const SensorDisplay = ({ inputSensor , onBackendReset }) => {
  let isFetching = false;
  const socket = useContext(WebSocketContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sensor, setSensor] = useState(inputSensor);
  const [sensorName, setSensorName] = useState(inputSensor.name);
  const [rangeLow, setRangeLow] = useState(inputSensor.range_low);
  const [rangeHigh, setRangeHigh] = useState(inputSensor.range_high);
  const [sensorValueCO2, setSensorValueCO2] = useState();
  const [sensorValueDO, setSensorValueDO] = useState();
  const [readFrequency, setReadFrequency] = useState();
  const [sensorData, setSensorData] = useState({ labels: [], datasets: [], });
     /* {
        label: 'Sensor Data',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        pointBackgroundColor: (context) => {          
          const value = context.raw?.y;
          if (value < rangeLow || value > rangeHigh) { // Highlight this point if value is 5
            return 'red'; // Highlight color
          }
          return 'blue'; // Default color
        },
        pointBorderColor: (context) => {
          const value = context.raw?.y;
          if (value < rangeLow || value > rangeHigh) { // Highlight this point if value is 5
            return 'red'; // Border color for highlighted point
          }
          return 'blue'; // Default border color
        },
        pointHoverBackgroundColor: 'yellow', // Hover effect for all points
        pointHoverBorderColor: 'yellow', // Hover effect for all points
        fill: true,
        lineTension: 0.4,
      },
    ],
  });*/
  const [chartOptions, setChartOptions] = useState({});

  // Web socket things
  useEffect(() => {
    setSensor(inputSensor);
    setRangeLow(parseFloat(sensor.range_low))
    setRangeHigh(parseFloat(sensor.range_high))
    //fetchSettings();
    setChartOptions({
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute', // Change the time unit as needed
          },
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          min: parseFloat(sensor.range_low) - 2, // Set the minimum y-axis value
          max: parseFloat(sensor.range_high) + 2, // Set the maximum y-axis value
          ticks: {
            callback: function(value) {
              return value === 5 ? '5 - Target' : value;
            }
          },
          title: {
            display: true,
            text: 'Value',
          },
        },
      },
      animation: false,
    });
    if (!socket) return;
    
    // Function to handle async fetch data packet and sensor data
    const fetchData = async () => {
      try {
        // Fetch the packet data and await its completion
        await fetchDataPacket();
        const intervalId = setInterval(fetchSensorData, 5000);
        return () => {
          clearInterval(intervalId);
          socket.off("response");
        };
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };
    fetchData();
  }, [socket]);

  const fetchSettings = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    setReadFrequency(data.settings[0].read_frequency);
  };

  const fetchDataPacket = async () => {
    return new Promise(async (resolve, reject) => {
    if (isFetching) return; // Prevent multiple fetches at the same time
    isFetching = true;
    try {
      const sensor = inputSensor
      const sensor_id = sensor._id;
      console.log(`packet-${sensorName}`)
      const packetData = await new Promise((resolve, reject) => {
        socket.emit("packet", { request: sensor_id });
        socket.once(`packet-${sensorName}`, (data) => {
          resolve(data); // Resolve promise when data is received
        });
      });
      const newData = packetData.packet_data || [];

      setSensorData((prevData) => {
        return {
          datasets: [
            ...prevData.datasets, // Keep previous datasets if any
            ...Object.keys(newData).map((sensorKey) => {
              const sensorData = newData[sensorKey];
      
              return {
                label: sensorKey, // Set the label as the sensor name
                data: sensorData.map((entry) => ({
                  x: new Date(entry.time * 1000).toISOString(), // Format the timestamp
                  y: entry.value // Use the value for y-axis
                })),
                borderColor: 'rgba(75,192,192,1)',
                fill: true,
                lineTension: 0.4,
                pointBackgroundColor: (context) => {
                  const value = context.raw?.y;
                  if (value < rangeLow || value > rangeHigh) { // Highlight this point if value is out of range
                    return 'red'; // Highlight color
                  }
                  return 'blue'; // Default color
                },
                pointBorderColor: (context) => {
                  const value = context.raw?.y;
                  if (value < rangeLow || value > rangeHigh) { // Highlight border color for out-of-range values
                    return 'red'; // Border color for highlighted point
                  }
                  return 'blue'; // Default border color
                },
                pointHoverBackgroundColor: 'yellow', // Hover effect for all points
                pointHoverBorderColor: 'yellow', // Hover effect for all points
              };
            }),
          ],
        };
      });
      // Optional: Reject the promise if there is an error with the socket event
      // setTimeout(() => reject(new Error('Timeout waiting for data')), 5000); // 5-second timeout
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
      isFetching = false; // Reset the flag once the fetch is complete
      resolve();
    }
  });
  };

  const fetchSensorData = async () => {
    try {
      const sensor = inputSensor
      const sensor_id = sensor._id;
      const updateData = await new Promise((resolve, reject) => {
        socket.emit("update", { request: sensor_id });
        socket.on(`update-${sensorName}`, (data) => {
          resolve(data); // Resolve promise when data is received
        });
      });
      const newData = updateData.update_data;
      setSensorValueCO2(newData[`${sensorName}-CO2`].value);
      setSensorValueDO(newData[`${sensorName}-DO`].value);
      setSensorData((prevData) => {
        // Map over newData to format it
        const updatedDatasets = Object.keys(newData).map((sensorKey) => {
          const sensor = newData[sensorKey]; // Get the sensor data object for each key
      
          // Check if this sensor already has data in the previous state
          const existingSensorData = prevData.datasets.find(
            (dataset) => dataset.label === sensorKey
          );
      
          // Create the new data object with the new point
          const newDataPoint = {
            x: new Date(sensor.time * 1000).toISOString(), // Convert Unix timestamp to ISO format
            y: sensor.value, // Measurement value for this sensor
          };
      
          // If the sensor already has data, append the new point to the existing data
          if (existingSensorData) {
            existingSensorData.data.push(newDataPoint); // Append new data point
            // Keep only the latest 20 data points
            if (existingSensorData.data.length > 100) {
              existingSensorData.data.shift(); // Remove the oldest entry
            }
            return existingSensorData;
          } else {
            // If the sensor is new, create a new dataset with the new data point
            return {
              label: sensorKey,
              data: [newDataPoint],
              borderColor: 'rgba(75,192,192,1)', // Customize colors as needed
              backgroundColor: 'rgba(75,192,192,0.2)',
              pointBackgroundColor: 'blue',
              pointBorderColor: 'blue',
              fill: true,
              lineTension: 0.4,
            };
          }
        });
      
        // Update the state with the new datasets, preserving previous ones and adding new data
        return {
          datasets: updatedDatasets,
        };
      });
      
      // Optional: Reject the promise if there is an error with the socket event
      // setTimeout(() => reject(new Error('Timeout waiting for data')), 5000); // 5-second timeout
    } catch (error) {
        console.error('Error fetching data:', error);
    }
  };

  // My attempt to fix the weird lag server issue
  useEffect(() => {
    const timer = setTimeout(() => {
      setSensor(inputSensor['inputSensor']);
    }, 1);

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
    onBackendReset();
    fetchSensor()
  }

  const fetchSensor = async () => {
    const response = await fetch("http://127.0.0.1:5000/sensors");
    const data = await response.json();

    // Format the sensors to extract the ID correctly
    const formattedSensors = data.sensors.map(sensor => ({
        ...sensor,
        _id: sensor._id.$oid // Extract the ID as a string
    }));
    setSensor(formattedSensors.find(newSensor => newSensor._id === inputSensor._id));
  };

  return (
    <div>
      <h2>{sensorName} Sensor Data</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <tr>
            <td>CO2 Reading:</td>
            <td>{sensorValueCO2 || "Loading..."}</td>
            </tr>
            <tr>
            <td>DO Reading:</td>
            <td>{sensorValueDO || "Loading..."}</td>
            </tr>
            <td>
              <Line
                data={{
                  datasets: sensorData.datasets, // Using the datasets from state
                }}
                options={ chartOptions }
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
            <ChangeRangeForm sensorChange={inputSensor} updateCallback={onUpdate} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SensorDisplay;