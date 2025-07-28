import { createContext, useState, Dispatch, SetStateAction, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated : boolean;
  isLoading : boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  login : Function;
  logout : Function;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider = ({ children } : any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const port : string = process.env.PORT!;
  let apiUrl : string = process.env.VITE_API_URL!;
  const mode : string = process.env.NODE_ENV!;
    
    
    if (mode !== "production"){
      apiUrl+=port
    }


  const login : Function = () => setIsAuthenticated(true);
  const logout : Function  = () => {
    setIsAuthenticated(false);
  }

// Check for token cookie on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/verify`, {
          method: "GET",
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
        });
        console.log('Response status:', response.status);
        console.log(response);
        
        if (response.status===200) {
          console.log('Auth check successful');
          setIsAuthenticated(true);
        } else {
          console.log('Auth check failed');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('Error during auth check:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
      
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading, setIsLoading, login, logout, }}>
      {children}
    </AuthContext.Provider>
  );
};