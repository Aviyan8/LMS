import React, { createContext, useEffect, useState } from "react";
import { makeApiRequest } from "../lib/api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMyProfile = async () => {
    try {
      const { response, error } = await makeApiRequest({
        endpoint: "/users/profile",
        method: "GET",
        suppressToast: true, // Suppress toast for auth check - 401 is expected when not logged in
      });

      if (error) {
        // User is not authenticated or token expired - this is expected on login page
        setLoading(false);
        return;
      }

      if (response) {
        setUser(response);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyProfile();
  }, []);

  const logout = async () => {
    try {
      // Call logout endpoint to clear cookie
      await makeApiRequest({
        endpoint: "/auth/logout",
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user state regardless of API call success
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
