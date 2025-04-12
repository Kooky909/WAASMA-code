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
  const [CO2rangeLow, setCO2RangeLow] = useState(inputSensor.measures.CO2.range_low);
  const [CO2rangeHigh, setCO2RangeHigh] = useState(inputSensor.measures.CO2.range_high);
  const [DOrangeLow, setDORangeLow] = useState(inputSensor.measures.DO.range_low);
  const [DOrangeHigh, setDORangeHigh] = useState(inputSensor.measures.DO.range_high);
  const [sensorValueCO2, setSensorValueCO2] = useState();
  const [sensorValueDO, setSensorValueDO] = useState();
  const [CO2Data, setCO2Data] = useState({ labels: [], datasets: [], });
  const [DOData, setDOData] = useState({ labels: [], datasets: [], });
  const [CO2chartOptions, setCO2ChartOptions] = useState({});
  const [DOchartOptions, setDOChartOptions] = useState({});

  // Web socket things
  useEffect(() => {
    setSensor(inputSensor);
    setCO2RangeLow(parseFloat(sensor.measures.CO2.range_low))
    setCO2RangeHigh(parseFloat(sensor.measures.CO2.range_high))
    setDORangeLow(parseFloat(sensor.measures.DO.range_low))
    setDORangeHigh(parseFloat(sensor.measures.DO.range_high))
    resetChartOptions( CO2rangeLow, CO2rangeHigh, DOrangeLow, DOrangeHigh );
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
  }, [socket]);

  const fetchSettings = async () => {
    const response = await fetch("http://127.0.0.1:5000/settings");
    const data = await response.json();
    return data.settings[0].read_frequency * 1000
  };

  const resetChartOptions = ( CO2L, CO2H, DOL, DOH ) => {
    setCO2ChartOptions({
      scales: {
        x: {
          type: 'time',
          time: { unit: 'minute', // Change the time unit as needed
          },
          title: { display: true, text: 'Time',},
        },
        y: {
          min: CO2L*0.5,
          max: CO2H*1.5,
          ticks: {
            callback: function(value) {
              if (value == CO2rangeLow) {
                return `Low Range - ${value}`;
              } else if (value == CO2rangeHigh) {
                return `High Range - ${value}`;
              } else {
                return value;
              }
            }
          },},},
      animation: false,
    });
    setDOChartOptions({
      scales: {
        x: {
          type: 'time',
          time: { unit: 'minute',},
          title: {display: true,text: 'Time',},
        },
        y: {
          min: DOL*0.5,
          max: DOH*1.5,
          ticks: {
            callback: function(value) {
              if (value == DOrangeLow) {
                return `Low Range - ${value}`;
              } else if (value == DOrangeHigh) {
                return `High Range - ${value}`;
              } else {
                return value;
              }
            }
          },},},
      animation: false,
    });
  }

  const fetchDataPacket = async () => {
    return new Promise(async (resolve, reject) => {
    if (isFetching) return; // Prevent multiple fetches at the same time
    isFetching = true;
    try {
      const sensor = inputSensor
      const sensor_id = sensor._id;
      const packetData = await new Promise((resolve, reject) => {
        socket.emit("packet", { request: sensor_id });
        socket.once(`packet-${sensorName}`, (data) => {
          resolve(data); // Resolve promise when data is received
        });
      });
      const newData = packetData.packet_data || [];
      const sensorKeys = Object.keys(newData);
      const sensor1Key = sensorKeys[0];
      const sensor2Key = sensorKeys[1];

      const sensor1Data = newData[sensor1Key];
      const sensor2Data = newData[sensor2Key];

      setCO2Data(() => ({
        datasets: [
          {
            label: sensor1Key,
            data: sensor1Data.map((entry) => ({
              x: new Date(entry.time * 1000).toISOString(),
              y: entry.value,
            })),
            borderColor: 'rgba(75,192,192,1)',
            lineTension: 0.4,
            pointBackgroundColor: (context) => {
              const value = context.raw?.y;
              return value < CO2rangeLow || value > CO2rangeHigh ? 'red' : 'blue';
            },
            pointBorderColor: (context) => {
              const value = context.raw?.y;
              return value < CO2rangeLow || value > CO2rangeHigh ? 'red' : 'blue';
            },
            pointHoverBackgroundColor: 'yellow',
            pointHoverBorderColor: 'yellow',
          }
        ]
      }));

      setDOData(() => ({
        datasets: [
          {
            label: sensor2Key,
            data: sensor2Data.map((entry) => ({
              x: new Date(entry.time * 1000).toISOString(),
              y: entry.value,
            })),
            borderColor: 'rgba(75,192,192,1)',
            lineTension: 0.4,
            pointBackgroundColor: (context) => {
              const value = context.raw?.y;
              return value < DOrangeLow || value > DOrangeHigh ? 'red' : 'blue';
            },
            pointBorderColor: (context) => {
              const value = context.raw?.y;
              return value < DOrangeLow || value > DOrangeHigh ? 'red' : 'blue';
            },
            pointHoverBackgroundColor: 'yellow',
            pointHoverBorderColor: 'yellow',
          }
        ]
      }));
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
      let tempCO2 = newData[`${sensorName}-CO2`].value;
      let tempDO = newData[`${sensorName}-DO`].value;
      let num1, num2, num3, num4;
      num1 = CO2rangeLow < tempCO2 ? CO2rangeLow : tempCO2;
      num2 = CO2rangeHigh > tempCO2 ? CO2rangeHigh : tempCO2;
      num3 = DOrangeLow < tempDO ? DOrangeLow : tempDO;
      num4 = DOrangeHigh > tempDO ? DOrangeHigh : tempDO;
      resetChartOptions(num1, num2, num3, num4);

      const sensorKeys = Object.keys(newData);
      const sensor1Key = sensorKeys[0];
      const sensor2Key = sensorKeys[1];

      const sensor1Data = newData[sensor1Key];
      const sensor2Data = newData[sensor2Key];

      setCO2Data((prevData) => {
        const existingSensorData = prevData.datasets.find(
          (dataset) => dataset.label === sensor1Key
        );
      
        const newDataPoint = {
          x: new Date(sensor1Data.time * 1000).toISOString(),
          y: sensor1Data.value,
        };
      
        let updatedDatasets;
      
        if (existingSensorData) {
          // Create a shallow copy of the datasets
          updatedDatasets = prevData.datasets.map((dataset) => {
            if (dataset.label === sensor1Key) {
              const newData = [...dataset.data, newDataPoint];
              if (newData.length > 100) newData.shift();
              return { ...dataset, data: newData };
            }
            return dataset;
          });
        } else {
          const newDataset = {
            label: sensor1Key,
            data: [newDataPoint],
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            pointBackgroundColor: 'blue',
            pointBorderColor: 'blue',
            lineTension: 0.4,
          };
          updatedDatasets = [...prevData.datasets, newDataset];
        }
        return { datasets: updatedDatasets };
      });

      setDOData((prevData) => {
        const existingSensorData = prevData.datasets.find(
          (dataset) => dataset.label === sensor2Key
        );
      
        const newDataPoint = {
          x: new Date(sensor2Data.time * 1000).toISOString(),
          y: sensor2Data.value,
        };
      
        let updatedDatasets;
        if (existingSensorData) {
          // Create a shallow copy of the datasets
          updatedDatasets = prevData.datasets.map((dataset) => {
            if (dataset.label === sensor1Key) {
              const newData = [...dataset.data, newDataPoint];
              if (newData.length > 100) newData.shift();
              return { ...dataset, data: newData };
            }
            return dataset;
          });
        } else {
          const newDataset = {
            label: sensor2Key,
            data: [newDataPoint],
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            pointBackgroundColor: 'blue',
            pointBorderColor: 'blue',
            lineTension: 0.4,
          };
          updatedDatasets = [...prevData.datasets, newDataset];
        }
        return { datasets: updatedDatasets };
      }); 
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
        <tbody>
          <tr>
            <tr>
            <td>CO2 Reading:</td>
            <td>{sensorValueCO2 || "..."}</td>
            </tr>
            <td>
              <Line
                data={{
                  datasets: CO2Data.datasets,
                }}
                options={ CO2chartOptions }
              width={300}
              height={150}
            />
            </td>
          </tr>
          <tr>
            <tr>
            <td>DO Reading:</td>
            <td>{sensorValueDO || "..."}</td>
            </tr>
            <td>
            <Line
                data={{
                  datasets: DOData.datasets,
                }}
                options={ DOchartOptions }
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