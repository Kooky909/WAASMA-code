import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // or use context

  if (!token) {
    return <Navigate to="/" />; // redirect to login
  }

  return children; // let them in
};

export default PrivateRoute;