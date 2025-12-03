import React, { createContext, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { makeApiRequest } from "../lib/api";

export const MembersContext = createContext();

const MembersProvider = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const { response, error } = await makeApiRequest({
        endpoint: "/librarians/users",
        method: "GET",
      });

      if (error) {
        setLoading(false);
        return;
      }

      // Backend returns array directly
      if (Array.isArray(response)) {
        setMembers(response);
      } else if (response?.data) {
        setMembers(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "LIBRARIAN") {
      fetchMembers();
    } else {
      setMembers([]);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <MembersContext.Provider
      value={{
        members,
        setMembers,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export default MembersProvider;
