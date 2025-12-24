import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState('Loading...');
    const [userRole, setUserRole] = useState('User');
    const [currentTeam, setCurrentTeam] = useState('All');
    const [userStatus, setUserStatus] = useState('Offline');
    const [userTask, setUserTask] = useState('');
    const [lastActive, setLastActive] = useState('Now');
    const [userId, setUserId] = useState(null);
    const [teamId, setTeamId] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get current user from Supabase auth
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Fetch user's profile to get full_name, role, team_id
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('full_name, email, role, team_id')
                        .eq('id', user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching user profile:', error);
                        setUserName(user.email || 'User');
                        setUserRole('User');
                        return;
                    }

                    if (profile) {
                        setUserId(user.id);
                        setUserName(profile.full_name || profile.email || 'User');
                        setUserRole(profile.role || 'User');
                        setTeamId(profile.team_id);
                    }
                } else {
                    setUserName('Guest');
                    setUserRole('Guest');
                }
            } catch (err) {
                console.error('Error in fetchUserData:', err);
                setUserName('User');
                setUserRole('User');
            }
        };

        fetchUserData();
    }, []);

    return (
        <UserContext.Provider value={{
            userName, setUserName,
            userRole, setUserRole,
            currentTeam, setCurrentTeam,
            userStatus, setUserStatus,
            userTask, setUserTask,
            lastActive, setLastActive,
            userId,      // Expose userId
            teamId       // Expose teamId or userTeamId (to avoid conflict with currentTeam which seems to be a filter)
        }}>
            {children}
        </UserContext.Provider>
    );
};
