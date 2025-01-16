import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { signOut } from '../actions/authActions';
import '../css/Sidebar.css';
import homeImage from '../images/image3.png';
import taskImage from '../images/image4.png';
import ntfImage from '../images/image5.png';
import settingImage from '../images/image6.png';


const SidebarLayout = ({ children }: any) => {
    const dispatch = useDispatch();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const users = useSelector((state: any) => state.user.users);
    const userID = localStorage.getItem('userID');
    const filteredUser = users.find((user: any) => user.id === userID);

    const handleSignOut = () => {
        dispatch(signOut());
        localStorage.removeItem('userToken');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`sidebar-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <button
                className={`hamburger-button ${isSidebarOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            >
                ☰
            </button>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="welcome1">
                    <h2>Welcome, {filteredUser?.username}!</h2>
                </div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">
                                <img src={homeImage} alt="Home Icon" className="link-icon" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/taskscreen">
                                <img src={taskImage} alt="Task Icon" className="link-icon" />
                                Task Assignment
                            </Link>
                        </li>
                        <li>
                            <Link to="/notifications">
                                <img src={ntfImage} alt="Notifications Icon" className="link-icon" />
                                Notifications
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings">
                                <img src={settingImage} alt="Settings Icon" className="link-icon" />
                                Settings
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleSignOut} className="sign-out-button">
                    Sign Out
                </button>
            </div>
            <div className={`content ${isSidebarOpen ? 'blurred' : ''}`}>{children}</div>
        </div>
    );
};

export default SidebarLayout;