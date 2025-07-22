import { useContext, useEffect } from 'react';
import { NavigateFunction, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const PrivateRoute = () => {
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const navigate : NavigateFunction = useNavigate(); // Get the navigate function

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <Outlet/> : null;

};

export default PrivateRoute;