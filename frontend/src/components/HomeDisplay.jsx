import React, { useContext, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend,
    LineElement, PointElement, Filler } from 'chart.js';
import { WebSocketContext } from "./WebSocketProvider";

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, Filler);

const HomeDisplay = () => {
  const socket = useContext(WebSocketContext);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // Web socket things
  useEffect(() => {
    if (!socket) return;
       
    // Function to handle async fetch data packet and sensor data
    const fetchData = async () => {
      try {
        // Fetch the packet data and await its completion
        await fetchDataPacket();
        const intervalId = setInterval(fetchSensorData, 1500);
        console.log("here")
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
    try {
      const packetData = await new Promise((resolve, reject) => {
        socket.emit("packet", { request: "home" });
        socket.once("packet_home", (data) => {
          resolve(data.packet_data); // Resolve promise when data is received
        });
      });
      setChartData({
        datasets: Object.keys(packetData).map((sensor, index) => ({
          label: `Sensor ${index + 1}`,
          data: packetData[sensor].map((entry) => ({ x: new Date(entry.time * 1000).toISOString(), y: entry.value })), // Each sensor has its own timestamps
          borderColor: `hsl(${index * 60}, 70%, 50%, 0.7)`,
          backgroundColor: `hsl(${index * 60}, 70%, 80%, 0.7)`,
          fill: true,
          lineTension: 0.4,
        }))
      });
      // Optional: Reject the promise if there is an error with the socket event
      // setTimeout(() => reject(new Error('Timeout waiting for data')), 5000); // 5-second timeout
      } catch (error) {
        console.error('Error fetching data:', error);
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
          const prevDataset = prevData?.datasets?.find((d) => d.label === `Sensor ${index + 1}`);

          // Preserve previous data and add new entries from the array
          const newEntries = [updateData[sensor]].map(entry => ({ x: new Date(entry.time * 1000).toISOStrin, y: entry.value }));

          // Preserve previous data and add new point
          const newData = [...prevDataset.data, ...newEntries ];
          // Keep only the latest 10 data points
          if (newData.length > 10) {
            newData.shift(); // Remove the oldest entry
          }
          return {
            label: `Sensor ${index + 1}`,
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
    }
  };

  return (
    <div>
      <h2>Real-Time Sensor Data</h2>
      <Line
        data={chartData}
        options={{
          scales: {
            x: {
              type: 'time',
              title: { display: true, text: 'Time' },
              time: {
                unit: 'minute', // Set the time unit for the x-axis
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
    </div>
  );
};

export default HomeDisplay;