import React from "react";
import { useState, useEffect } from "react";
import ChangeRangeForm from "./ChangeRangeForm";

const SensorSettings = () => {

    const [sensors, setSensors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentSensor, setCurrentSensor] = useState({})

    useEffect(() => {
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
        fetchSensors()
      }
    
    const closeModal = () => {
        setIsModalOpen(false)
        setCurrentSensor({})
      }
    
      const openCreateModal = () => {
        if (!isModalOpen) setIsModalOpen(true)
      }
    
      const openEditModal = (sensor) => {
        if (isModalOpen) return
        setCurrentSensor(sensor)
        setIsModalOpen(true)
      }
    
    return <div>
        <h2>SENSORS SETTINGS</h2>
        <table>
            <thead>
                <tr>
                    <th>Sensor Type  </th>
                    <th>Tank #  </th>
                    <th>Communication  </th>
                    <th>Range  </th>
                </tr>
            </thead>
            <tbody>
                {sensors.map((sensor) => (
                    <tr key={sensor.id}>
                        <td>{sensor.type}</td>
                        <td>{sensor.tank}</td>
                        <td>{sensor.communication}</td>
                        <td>{sensor.range}</td>
                        <td>
                            <button onClick={() => openEditModal(sensor)}>Change Range</button>
                
                        </td>
                    </tr>
                ))}
            </tbody>
            {isModalOpen && currentSensor && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        {/* Pass selectedSensor data to the form */}
                        <ChangeRangeForm sensorChange={currentSensor} updateCallback={onUpdate} />
                    </div>
                </div>
            )}
        </table>
    </div>
}

export default SensorSettings