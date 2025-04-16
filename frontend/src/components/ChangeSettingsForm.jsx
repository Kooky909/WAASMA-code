import { useState } from "react";

const ChangeSettingsForm = ({ settingChange, currentValue, updateCallback }) => {

    const [read_frequency, setFrequency] = useState(parseInt(currentValue, 10) || "");

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            read_frequency
        }
        const url = `http://127.0.0.1:5000/change_setting/${settingChange.$oid}`;
        const options = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        if (!response.ok) {
            if (response.status === 401) {
              alert('Your session has expired. Please log in again.');
              window.location.href = '/';
            } else if (response.status === 403) {
              alert('You do not have permission to access this resource.');
            } else {
              // Other errors, like 500, etc.
              const data = await response.json()
              alert('Something went wrong:', data.message);
            }
          } else {
            // Process the response if the status is OK
            const data = await response.json();
            console.log(data);
            updateCallback()
          }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor="read_frequency">Frequency:</label>
                <input
                    type="text"
                    id="read_frequency"
                    value={read_frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                />
            </div>
            <button type="submit">{"Update"}</button>
        </form>
    );
};

export default ChangeSettingsForm;