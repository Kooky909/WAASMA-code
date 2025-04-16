import { useState } from "react";

const EditUserSettingsForm = ({ currentUser = {}, updateCallback }) => {
    console.log(currentUser._id);
    const [firstName, setFirstName] = useState(currentUser.firstName || "");
    const [lastName, setLastName] = useState(currentUser.lastName || "");
    const [email, setEmail] = useState(currentUser.email || "");
    const [password, setPassword] = useState(currentUser.password || "");
    const [role, setRole] = useState(currentUser.role || "");
    const [notifs, setNotifs] = useState(currentUser.notifs || "");

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            firstName,
            lastName,
            email,
            password,
            role,
            notifs
        }
        const url = `http://127.0.0.1:5000/update_user/${currentUser._id}`;
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
                <label htmlFor="email">Email:</label>
                <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="text"
                    id="password"
                    value={null}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="notifs">Notifs:</label>
                <input
                    type="text"
                    id="notifs"
                    value={notifs}
                    onChange={(e) => setNotifs(e.target.value)}
                />
            </div>
            <button className="update-my-settings" type="submit">Update</button>
        </form>
    );
};

export default EditUserSettingsForm