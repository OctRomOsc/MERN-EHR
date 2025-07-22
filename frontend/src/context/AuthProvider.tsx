import { createContext, useState, Dispatch, SetStateAction, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated : boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  login : Function;
  logout : Function;
  user : string;
  setUser : Dispatch<SetStateAction<string>>
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider = ({ children } : any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ user, setUser ] = useState("")


  const login : Function = () => setIsAuthenticated(true);
  const logout : Function  = () => setIsAuthenticated(false);

  // Check for token cookie on load
  useEffect(() => {
    const cookieExists = document.cookie.includes('token=');
    setIsAuthenticated(cookieExists);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, login, logout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};