import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from '../UI/Chatbot';

const Layout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <div style={{
                marginLeft: isCollapsed ? '80px' : '260px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                transition: 'margin-left 0.3s ease'
            }}>
                <Header />
                <main style={{ flex: 1, padding: 'var(--spacing-xl)', backgroundColor: 'var(--background)' }}>
                    {children}
                </main>
                <Chatbot />
            </div>
        </div>
    );
};

export default Layout;
