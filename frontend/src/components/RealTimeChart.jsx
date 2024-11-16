import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend,
  LineElement, PointElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register necessary components in Chart.js
ChartJS.register(
  CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, LineElement, PointElement
);

function RealTimeChart() {
  // Initialize the state for chart data
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Real-Time Data',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        lineTension: 0.4,
      },
    ],
  });

  // Function to update chart data (simulating new data points)
  const addData = () => {
    setChartData((prevData) => {
      const newLabels = [...prevData.labels];
      const newData = [...prevData.datasets[0].data];

      // Add a new timestamp (current time) and a random data point
      const newTime = new Date(); // Current time as label
      const newValue = Math.floor(Math.random() * 100); // Random data for example purposes

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
  };

  // Update the chart data every second
  useEffect(() => {
    const intervalId = setInterval(addData, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h2>Real-Time Chart</h2>
      <Line
        data={chartData}
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
      />
    </div>
  );
}

export default RealTimeChart;