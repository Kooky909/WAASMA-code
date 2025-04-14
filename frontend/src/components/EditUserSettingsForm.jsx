import { useState } from "react";

const EditUserSettingsForm = ({ currentUser = {}, updateCallback }) => {
    console.log(currentUser._id);
    const [firstName, setFirstName] = useState(currentUser.firstName || "");
    const [lastName, setLastName] = useState(currentUser.lastName || "");
    const [email, setEmail] = useState(currentUser.email || "");
    const [role, setRole] = useState(currentUser.role || "");

    const onSubmit = async (e) => {
        e.preventDefault()

        const data = {
            firstName,
            lastName,
            email,
            role
        }
        const url = `http://127.0.0.1:5000/update_user/${currentUser._id}`;
        const options = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(url, options)
        if (response.status !== 201 && response.status !== 200) {
            const data = await response.json()
            alert(data.message)
        } else {
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
                <label htmlFor="role">Role:</label>
                <input
                    type="text"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                />
            </div>
            <button className="update-my-settings" type="submit">Update</button>
        </form>
    );
};

export default EditUserSettingsForm