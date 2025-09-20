import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios"; 
import { toast } from "sonner";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/refresh", { withCredentials: true });
        const data = res.data;

        setAuth({
          accessToken: data.accessToken,
          role: data.user?.role || data.role,
          username: data.user?.username || data.username,
        }); 
        
      } catch (error) {
        console.error("Auth check failed:", error.response?.data || error.message);
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
