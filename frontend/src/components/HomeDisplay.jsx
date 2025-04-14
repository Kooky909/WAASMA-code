import React, { useContext, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend,
    LineElement, PointElement, Filler } from 'chart.js';
import { WebSocketContext } from "./WebSocketProvider";

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, Filler);

const HomeDisplay = ({ }) => {
  const socket = useContext(WebSocketContext);
  const [sensors, setSensors] = useState({ labels: [], datasets: [] });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartOptions, setChartOptions] = useState({});

  // Web socket things
  useEffect(() => {
    if (!socket) return;
       
    // Function to handle async fetch data packet and sensor data
    const fetchData = async () => {
      try {
        // Fetch the packet data and await its completion
        const read_frequency = await fetchSettings();
        await fetchDataPacket();
        while (read_frequency == 0) {
          continue
        }
        const intervalId = setInterval(fetchSensorData, read_frequency);
        return () => {
          clearInterval(intervalId);
          socket.off("response");
        };
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };
    fetchData();
    fetchSensors();
  }, [socket]);

  const fetchSettings = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    return data.settings[0].read_frequency * 1000
  };

  const fetchSensors = async () => {
    const response = await fetch("http://127.0.0.1:5000/sensors");
    const data = await response.json();

    // Format the sensors to extract the ID correctly
    const formattedSensors = data.sensors.map(sensor => ({
        ...sensor,
        _id: sensor._id.$oid // Extract the ID as a string
    }));
    setSensors(formattedSensors);
  };

  const fetchDataPacket = async () => {
    return new Promise(async (resolve, reject) => {
    try {
      const packetData = await new Promise((resolve, reject) => {
        socket.emit("packet", { request: "home" });
        socket.once("packet_home", (data) => {
          resolve(data.packet_data); // Resolve promise when data is received
        });
      });
      setChartData({
        datasets: Object.keys(packetData).map((sensor, index) => ({
          label: sensor,
          data: packetData[sensor].map((entry) => ({ x: new Date(entry.time * 1000).toISOString(), y: entry.value })), // Each sensor has its own timestamps
          borderColor: `hsl(${index * 60}, 70%, 50%, 0.7)`,
          backgroundColor: `hsl(${index * 60}, 70%, 80%, 0.7)`,
          fill: true,
          lineTension: 0.4,
        }))
      });
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
            title: {
              display: true,
              text: 'Sensor Values',
            },
          },
        },
        animation: false,
      });
      // Optional: Reject the promise if there is an error with the socket event
      // setTimeout(() => reject(new Error('Timeout waiting for data')), 5000); // 5-second timeout
      } catch (error) {
        console.error('Error fetching data:', error);
        SpeechSynthesisErrorEvent('Something went wrong. Try again');
      } finally {
        resolve();
      }
    });
  };
    
  const fetchSensorData = async () => {
    try {
      const updateData = await new Promise((resolve, reject) => {
        socket.emit("update", { request: "home" });
        socket.on("update_home", (data) => {
          resolve(data.update_data); // Resolve promise when data is received
        });
      });
      setChartData((prevData) => ({
        datasets: Object.keys(updateData).map((sensor, index) => {
          // Find existing dataset for this sensor
          const prevDataset = prevData?.datasets?.find((d) => d.label === sensor);

          // Preserve previous data and add new entries from the array
          const newEntries = [updateData[sensor]].map(entry => ({ x: new Date(entry.time * 1000).toISOString(), y: entry.value }));

          // Preserve previous data and add new point
          const newData = [...prevDataset.data, ...newEntries ];
          // Keep only the latest 20 data points
          if (newData.length > 100) {
            newData.shift(); // Remove the oldest entry
          }
          return {
            label: sensor,
            data: newData,
            borderColor: `hsl(${index * 60}, 70%, 50%, 0.7)`,
            backgroundColor: `hsl(${index * 60}, 70%, 80%, 0.7)`,
            fill: true,
            lineTension: 0.4,
          };
        })
      }));
      // Optional: Reject the promise if there is an error with the socket event
      // setTimeout(() => reject(new Error('Timeout waiting for data')), 5000); // 5-second timeout
    } catch (error) {
      console.error('Error fetching data:', error);
      SpeechSynthesisErrorEvent('Something went wrong. Try again');
    }
  };

  return (
    <div>
      <Line
        data={chartData}
        options={ chartOptions }
      />
    </div>
  );
};

export default HomeDisplay;