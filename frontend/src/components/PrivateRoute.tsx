import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const PrivateRoute = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;

  const isLoading = authContext?.isLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet/> : <Navigate to="/" replace />;

};

export default PrivateRoute;