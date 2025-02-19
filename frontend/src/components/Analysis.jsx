import { useState, useEffect } from "react";
import UserList from "./UserList";
import UserSettings from "./UserSettings";
import CreateUserForm from "./CreateUserForm";
import "./UsersStyles.css";

function Analysis() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  // Fetch users on initial render
  /*useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/users");
      const data = await response.json();

      const formattedUsers = data.users.map(user => ({
        ...user,
        _id: user._id.$oid, // Extract ID as string
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const openModal = (user = {}) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser({});
  };

  const onUpdate = () => {
    closeModal();
    fetchUsers();
  };
  */
  return (
    <div className="users-container">
      <header className="users-header">
        <h1>Analysis Tool</h1>
        {/*<UserSettings />*/}
      </header>
{/*}
      <main className="users-main">
        <UserList
          users={users}
          updateUser={openModal}
          updateCallback={onUpdate}
        />
        <button className="create-user-button" onClick={() => openModal()}>
          Create New User
        </button>
      </main>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <CreateUserForm
              existingUser={currentUser}
              updateCallback={onUpdate}
            />
          </div>
        </div>
      )} */}
    </div>
  );
}

export default Analysis;
