import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState('Alex Morgan');
    const [currentTeam, setCurrentTeam] = useState('All'); // 'All', 'Engineering', 'Design', 'Product', 'Sales', 'Marketing'

    return (
        <UserContext.Provider value={{ userName, setUserName, currentTeam, setCurrentTeam }}>
            {children}
        </UserContext.Provider>
    );
};
