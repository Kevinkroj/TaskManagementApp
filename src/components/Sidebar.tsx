import React from 'react';
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

    const handleSignOut = () => {
        dispatch(signOut());
        localStorage.removeItem('userToken');
    };


    return (
        <div className="sidebar-layout">
            <div className="sidebar">
                <div className="welcome">
                    <h2>Welcome , User!</h2>
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
                                <img src={taskImage} alt="Home Icon" className="link-icon" />
                                Task Assingment
                            </Link>
                        </li>
                        <li>
                            <Link to="/notifications">
                                <img src={ntfImage} alt="Home Icon" className="link-icon" />
                                Notifications
                            </Link>
                        </li>
                        <li>
                            <Link to="/settings">
                                <img src={settingImage} alt="Home Icon" className="link-icon" />
                                Settings
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
            </div>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default SidebarLayout;
