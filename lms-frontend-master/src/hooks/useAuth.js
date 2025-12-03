import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const { user, setUser, loading, logout } = useContext(AuthContext);

  return { user, setUser, loading, logout };
};

export default useAuth;
