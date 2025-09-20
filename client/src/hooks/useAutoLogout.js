// src/hooks/useAutoLogout.js
import { useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function useAutoLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const expiry = decoded.exp * 1000; // convert to ms
      const now = Date.now();
      const timeout = expiry - now;

      if (timeout <= 0) {
        // token already expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/");
      } else {
        // set timer for auto logout
        const timer = setTimeout(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
          navigate("/");
        }, timeout);

        // cleanup
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      navigate("/");
    }
  }, [navigate]);
}
