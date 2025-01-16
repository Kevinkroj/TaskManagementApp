import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signIn } from '../actions/authActions';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SignInScreen.css';
import welcomeImage from '../images/login-img.png';
import accountImage from '../images/image1.png';
import passImage from '../images/image2.png';



function SignInScreen() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        try {
            const response = await axios.post('http://localhost:5001/signin', {
                email: username,
                password: password,
            });

            const data = response.data;  // `response.data` holds the response body
            console.log('Sign-in response:', data);

            // Save accessToken and ensure `id` exists in the response
            if (data.accessToken && data.user && data.user.id) {
                localStorage.setItem('userToken', data.accessToken);
                localStorage.setItem('userID', data.user.id);  // Use `data.user.id` if nested

                // Fetch user details
                const userResponse = await axios.get(`http://localhost:5001/users/${data.user.id}`);

                const userData = userResponse.data;
                console.log('User data:', userData);

                localStorage.setItem('userRole', userData.role);
                dispatch(signIn(data.accessToken));
            } else {
                setError('Invalid login response structure');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Something went wrong, please try again');
        }
    };


    return (
        <div className="sign-in-page">
            <div className="image-container">
                <img
                    src={welcomeImage}
                    alt="Welcome"
                    className="welcome-image"
                />
            </div>
            <div className="sign-in-container">
                <h1>TaskTrail</h1>
                <div className="input-group">
                    <div className="input-container">
                        <img src={accountImage} alt="Username Icon" className="input-logo" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your email"
                            className="input-field"
                        />
                    </div>
                    <div className="input-container">
                        <img src={passImage} alt="Password Icon" className="input-logo" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input-field"
                        />
                    </div>
                </div>

                <button onClick={handleSignIn} className="sign-in-button">Log In</button>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}

export default SignInScreen;
