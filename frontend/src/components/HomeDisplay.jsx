import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, Filler } from 'chart.js';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend, Filler);

const HomeDisplay = () => {
    const [chartData, setChartData] = useState({
        labels: [], // x-axis labels (e.g., timestamps)
        datasets: [
            {
                label: 'Sensor 1',
                data: [], // Sensor 1 Data
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
                lineTension: 0.4,
            },
            {
                label: 'Sensor 2',
                data: [], // Sensor 2 Data
                borderColor: 'rgba(192,75,192,1)',
                backgroundColor: 'rgba(192,75,192,0.2)',
                fill: true,
                lineTension: 0.4,
            },
        ],
    });

    // Add new data every second
    useEffect(() => {
        const interval = setInterval(() => {
            addData();
        }, 1000);

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    const addData = () => {
        setChartData((prevData) => {
            const newLabels = [...prevData.labels];
            const sensor1Data = [...prevData.datasets[0].data];
            const sensor2Data = [...prevData.datasets[1].data];

            // Add new timestamp and data points
            const newTime = new Date().toLocaleTimeString(); // Current time as label
            const sensor1Value = Math.random() * 100; // Random data for Sensor 1
            const sensor2Value = Math.random() * 50; // Random data for Sensor 2

            newLabels.push(newTime);
            sensor1Data.push(sensor1Value);
            sensor2Data.push(sensor2Value);

            // Keep only the latest 10 data points
            if (newLabels.length > 10) {
                newLabels.shift();
                sensor1Data.shift();
                sensor2Data.shift();
            }

            return {
                labels: newLabels,
                datasets: [
                    { ...prevData.datasets[0], data: sensor1Data },
                    { ...prevData.datasets[1], data: sensor2Data },
                ],
            };
        });
    };

    return (
        <div>
            <h2>Real-Time Sensor Data</h2>
            <Line
                data={chartData}
                options={{
                    scales: {
                        x: {
                            type: 'category',
                            title: { display: true, text: 'Time' },
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