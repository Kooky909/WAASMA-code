import React, { useState, useEffect } from "react";
import EditUserSettingsForm from "./EditUserSettingsForm";
import "./UsersStyles.css";

const UserSettings = () => {
  const [userSettings, setSettings] = useState(null); // Initialized to null for better error handling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading]= useState(true); // Tracks loading state

  const currentUserId = "6743383f48ce505f5fb7be0a";

  // Fetch user settings when the component mounts
  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/user_settings/${currentUserId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      // Format the user settings correctly
      const formattedSettings = {
        ...data.settings,
        _id: data.settings._id,
      };
      console.log("Fetched and formatted settings:", formattedSettings);
      setSettings(formattedSettings);
    } catch (error) {
      console.error("Failed to fetch user settings:", error.message);
    }
  };

  const onUpdate = () => {
    closeModal();
    fetchUserSettings();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openEditModal = () => {
    setIsModalOpen(true);
  };

  if (!userSettings) {
    return <p>Loading user settings...</p>; // Graceful loading state
  }

  return (
    <div className="user-settings-container">
      <h2 className="user-settings-title">My User Settings:</h2>
      <table className="user-settings-table">
        <tbody>
          <tr className="user-settings-row">
            <th className="user-settings-label">Name</th>
            <td className="user-settings-value">{`${userSettings.firstName} ${userSettings.lastName}`}</td>
          </tr>
          <tr className="user-settings-row">
            <th className="user-settings-label">Email</th>
            <td className="user-settings-value">{userSettings.email}</td>
          </tr>
          <tr className="user-settings-row">
            <th className="user-settings-label">Password</th>
            <td className="user-settings-value">********</td>
          </tr>
          <tr className="user-settings-row">
            <th className="user-settings-label">Role</th>
            <td className="user-settings-value">{userSettings.role}</td>
          </tr>
          <tr className="user-settings-row">
            <th className="user-settings-label">Notifications</th>
            <td className="user-settings-value">{userSettings.notifs}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <button className="user-settings-edit-button" onClick={openEditModal}>
        Edit Settings
      </button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-users" onClick={closeModal}>
              &times;
            </span>
            {<EditUserSettingsForm currentUser={userSettings} updateCallback={onUpdate} /> }
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
