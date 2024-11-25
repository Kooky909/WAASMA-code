import React from "react";
import { useState, useEffect } from "react";
import EditUserSettingsForm from "./EditUserSettingsForm";

const UserSettings = () => {

    const [userSettings, setSettings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentUserId = '670ab44da2c0d02c67859a36';

    useEffect(() => {
        fetchUserSettings()
      }, []);

    const fetchUserSettings = async () => {
        const response = await fetch(`http://127.0.0.1:5000/user_settings/${currentUserId}`);
        const data = await response.json();
        console.log(data);
        // Format the user settings to extract the ID correctly
        const formattedSettings = {
            ...data.settings, // Spread the existing settings
            _id: data.settings._id // Extract the ID as a string
        };
        console.log(formattedSettings);
        setSettings(formattedSettings);
      };
    
      const onUpdate = () => {
        closeModal()
        fetchUserSettings()
      }
    
    const closeModal = () => {
        setIsModalOpen(false)
      }
    
      const openEditModal = () => {
        if (!isModalOpen) setIsModalOpen(true)
      }
    
    return <div>
        <h2>MY USER SETTINGS</h2>
        <table>
            <tbody>
                <tr>
                    <tr>
                    <th>Name  </th>
                    <td>{`${userSettings.firstName} ${userSettings.lastName}`}</td>
                    </tr>
                    <tr>
                    <th>Email  </th>
                    <td>{userSettings.email}</td>
                    </tr>
                    <tr>
                    <th>Password  </th>
                    </tr>
                    <tr>
                    <th>Role  </th>
                    <td>{userSettings.role}</td>
                    </tr>
                    <tr>
                    <th>Notifications  </th>
                    <td>{userSettings.notifs}</td>
                    </tr>
                </tr>
                <button onClick={() => openEditModal()}>Edit Settings</button>
                {isModalOpen && <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <EditUserSettingsForm currentUser={userSettings} updateCallback={onUpdate} />
                    </div>
                </div>
                }
            </tbody>
        </table>
    </div>
}

export default UserSettings;