import { useState } from "react";

const CreateUserForm = ({ existingUser = {}, updateCallback }) => {
    console.log(existingUser._id);
    const [firstName, setFirstName] = useState(existingUser.firstName || "");
    const [lastName, setLastName] = useState(existingUser.lastName || "");
    const [email, setEmail] = useState(existingUser.email || "");
    const [password, setPassword] = useState(existingUser.password || "");
    const [role, setRole] = useState(existingUser.role || "");
    const [notifs, setNotifs] = useState(existingUser.notifs || "");

    const updating = Object.entries(existingUser).length !== 0

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
        const url = "http://127.0.0.1:5000/" + (updating ? `update_user/${existingUser._id}` : "create_user")
        const options = {
            method: updating ? "PATCH" : "POST",
            headers: {
                "Content-Type": "application/json"
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
              const responseData = await response.json()
              alert('Something went wrong:', responseData.message);
            }
          } else {
            // Process the response if the status is OK
            const responseData = await response.json();
            console.log(responseData);
            updateCallback()
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor="firstName">First Name:</label>
                <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="lastName">Last Name:</label>
                <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </div>
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
                <label htmlFor="role">Role:</label>
                <input
                    type="text"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                />
            </div>
            <button type="submit">{updating ? "Update" : "Create"}</button>
        </form>
    );
};

export default CreateUserForm