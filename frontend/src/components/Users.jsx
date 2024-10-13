import { useState, useEffect } from "react";
import UserList from "./UserList";
import CreateUserForm from "./CreateUserForm";

function Users() {

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState({})

  useEffect(() => {
    fetchUsers()
  }, []);

  const fetchUsers = async () => {
    const response = await fetch("http://127.0.0.1:5000/users");
    const data = await response.json();

    // Format the users to extract the ID correctly
    const formattedUsers = data.users.map(user => ({
        ...user,
        _id: user._id.$oid // Extract the ID as a string
    }));
    console.log(formattedUsers);
    setUsers(formattedUsers);
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentUser({})
  }

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true)
  }

  const openEditModal = (user) => {
    if (isModalOpen) return
    setCurrentUser(user)
    setIsModalOpen(true)
  }

  const onUpdate = () => {
    closeModal()
    fetchUsers()
  }

  return (
    <>
      <UserList users={users} updateUser={openEditModal} updateCallback={onUpdate} />
      <button onClick={openCreateModal}>Create New User</button>
      {isModalOpen && <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={closeModal}>&times;</span>
          <CreateUserForm existingUser={currentUser} updateCallback={onUpdate} />
        </div>
      </div>
      }
    </>
  );
}

export default Users;