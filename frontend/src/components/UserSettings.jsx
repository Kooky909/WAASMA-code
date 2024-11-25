import React, { useState, useEffect } from "react";

/* Uncomment if EditUserSettingsForm is available */
// import EditUserSettingsForm from "./EditUserSettingsForm";

const UserSettings = () => {
  const [userSettings, setSettings] = useState(null); // Initialized to null for better error handling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading]= useState(true); // Tracks loading state

  const currentUserId = "670ab44da2c0d02c67859a36";

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
      <h2 className="user-settings-title">MY USER SETTINGS</h2>
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
      <button className="user-settings-edit-button" onClick={openEditModal}>
        Edit Settings
      </button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            {/* Replace with actual form component when available */}
            {/* <EditUserSettingsForm currentUser={userSettings} updateCallback={onUpdate} /> */}
            <p>Form to edit settings goes here!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
