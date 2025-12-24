import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState('Alex Morgan');
    const [currentTeam, setCurrentTeam] = useState('All'); // 'All', 'Engineering', 'Design', 'Product', 'Sales', 'Marketing'
    const [userStatus, setUserStatus] = useState('Offline'); // 'Online', 'Away', 'Offline'
    const [userTask, setUserTask] = useState('');
    const [lastActive, setLastActive] = useState('Now');

    return (
        <UserContext.Provider value={{
            userName, setUserName,
            currentTeam, setCurrentTeam,
            userStatus, setUserStatus,
            userTask, setUserTask,
            lastActive, setLastActive
        }}>
            {children}
        </UserContext.Provider>
    );
};
