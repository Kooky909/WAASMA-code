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

const SensorDisplay = ( inputSensor ) => {
  let isFetching = false;
  const socket = useContext(WebSocketContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sensor, setSensor] = useState(inputSensor);
  const [sensorValue, setSensorValue] = useState();
  const [sensorData, setSensorData] = useState({
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

  // Web socket things
  useEffect(() => {
    setSensor(inputSensor);
    if (!socket) return;
    
    // Function to handle async fetch data packet and sensor data
    const fetchData = async () => {
      try {
        // Fetch the packet data and await its completion
        await fetchDataPacket();
        const intervalId = setInterval(fetchSensorData, 1500);
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

  const fetchDataPacket = async () => {
    return new Promise(async (resolve, reject) => {
    if (isFetching) return; // Prevent multiple fetches at the same time
    isFetching = true;
    try {
      const sensor = inputSensor.inputSensor
      const sensor_id = sensor._id;
      const packetData = await new Promise((resolve, reject) => {
        socket.emit("packet", { request: sensor_id });
        socket.once("packet", (data) => {
          resolve(data); // Resolve promise when data is received
        });
      });
      //const newLabels = packetData.packet_labels || [];
      const newData = packetData.packet_data || [];

      setSensorData((prevData) => {
        return {
          datasets: [{
            ...prevData.datasets[0],
            data: [
              ...prevData.datasets[0].data,
              ...newData.map((entry) => ({ x: new Date(entry.time * 1000).toISOString(), y: entry.value })) // Format the data as x and y
            ],
          }],
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
      const sensor = inputSensor.inputSensor
      const sensor_id = sensor._id;
      const updateData = await new Promise((resolve, reject) => {
        socket.emit("update", { request: sensor_id });
        socket.on("update", (data) => {
          resolve(data); // Resolve promise when data is received
        });
      });
      const newData = updateData.update_data;
      setSensorValue(newData.value);
      setSensorData((prevData) => {
        const holyData = [
              ...prevData.datasets[0].data,
              { x: new Date(newData.time * 1000).toISOString(), y: newData.value }
            ];
        // Keep only the latest 10 data points
        if (holyData.length > 10) {
          holyData.shift(); // Remove the oldest entry
        }
        return {
          datasets: [{
            ...prevData.datasets[0],
            data: holyData,
          }],
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
    setSensor(formattedSensors.find(newSensor => newSensor._id === sensor._id));
  };

  return (
    <div>
      <h2>{sensor.name} Sensor Data</h2>
      <table>
        <thead>
          <tr>
            <th>Current Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{sensorValue || "Loading..."}</td>
            <td>
              <Line
                data={sensorData}
                options={{
                scales: {
                  x: {
                    type: 'time',
                    time: {
                      unit: 'minute', // Set the time unit for the x-axis
                      stepSize: 100,     //100 minutes 
                    },
                    title: { display: true, text: 'Time' },
                  },
                  y: {
                    beginAtZero: true, // Start the y-axis at zero
                    title: { display: true, text: 'Value' },
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