import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend } from 'chart.js';

// Register components in Chart.js
ChartJS.register(CategoryScale, LinearScale, TimeScale, Title, Tooltip, Legend);

const HomeDisplay = () => {

    useEffect (() => {
        // Update the chart data every second
        const intervalId = setInterval(addData, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    /*useEffect(() => {
        fetchSensors()
    }, []);

    const fetchSensors = async () => {
        const response = await fetch("http://127.0.0.1:5000/sensors");
        const data = await response.json();

    // Format the sensors to extract the ID correctly
    const formattedSensors = data.sensors.map(sensor => ({
        ...sensor,
        _id: sensor._id.$oid // Extract the ID as a string
        }));
        console.log(formattedSensors);
        setSensors(formattedSensors);
    };

    const onUpdate = () => {
        closeModal()
        //fetchSensors()
    }*/

    // State for the chart data
    const [chartData, setChartData] = useState({
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

    // Function to add new data to the chart
    const addData = () => {
        setChartData((prevData) => {
            const newLabels = [...prevData.labels];
            const newData = [...prevData.datasets[0].data];

            // Add a new label and data point
            const newTime = new Date().toLocaleTimeString(); // Current time as label
            const newValue = Math.floor(Math.random() * 100); // Random data for example purposes

            newLabels.push(newTime);
            newData.push(newValue);

            // Keep only the latest 10 data points
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

    return (
        <div>
            <h2>Real-Time Sensor Data</h2>
            <Line
                data={chartData}
                options={{
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'second',
                            },
                        },
                        y: {
                            beginAtZero: true,
                        },
                    },
                    animation: false,
                }}
            />
        </div>
    );
};

export default HomeDisplay