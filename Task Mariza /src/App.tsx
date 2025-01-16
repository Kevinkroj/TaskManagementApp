import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { restoreToken, signIn, signOut } from './actions/authActions';
import SidebarLayout from './components/Sidebar';
import Example from './screens/example';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationScreen from './screens/NotificationScreen';
import SignInScreen from './screens/SignInScreen';
import TaskScreen from './screens/Taskassigments';
import store from './store';
import { useTranslation } from 'react-i18next';
import TaskDetails from './screens/TaskDetails';

function App() {
  const dispatch = useDispatch();
  const { isLoading, userToken } = useSelector((state: any) => state.auth);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // const [languageBased, setLanguageBasedOnLocation] = useState();

  const { i18n } = useTranslation();


  useEffect(() => {
    if (userToken) {
      console.log('User has signed in with token:', userToken);

      setIsSignedIn(true);
    } else if (userToken === null) {
      console.log('eshte logout');
      setIsSignedIn(false);

    }
  }, [userToken]);

  const setLanguageBasedOnLocation = (countryCode: string) => {
    const countryLanguageMapping: { [key: string]: string } = {
      US: 'en',
      FR: 'fr',
      AL: 'sq',
    };

    const language = countryLanguageMapping[countryCode] || 'en';
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  // Function to load the language from localStorage if available
  const loadLanguageFromLocalStorage = () => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    } else {
      // If no language stored, try setting it based on geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`)
            .then(response => response.json())
            .then(data => {
              const userCountry = data.countryCode; // e.g., 'US'
              setLanguageBasedOnLocation(userCountry);
            });
        },
        (error) => {
          console.error('Error fetching location:', error);
        }
      );
    }
  };

  useEffect(() => {
    loadLanguageFromLocalStorage(); // Try to load language from localStorage on component mount
  }, []);



  useEffect(() => {
    // Fetch the token from localStorage
    const bootstrapAsync = async () => {
      let userToken: any;

      try {
        userToken = localStorage.getItem('userToken');
        console.log('hyri');
        if (userToken !== null) {
          setIsSignedIn(true);
        } else {
          setIsSignedIn(false);
        }

      } catch (e) {
        console.log('hyri error');

        // Error restoring token
      }

      dispatch(restoreToken(userToken));
    };

    bootstrapAsync();
  }, [dispatch]);

  if (isLoading) {
    // Show loading state while the token is being restored
    return <div>Loading...</div>;
  }



  return (
    <Router>
      <Routes>
        {isSignedIn === true ? (
          // Authenticated user flow
          <>
            <Route path="/" element={<SidebarLayout> <HomeScreen /></SidebarLayout>} />
            <Route path="/taskscreen" element={<SidebarLayout> <TaskScreen /></SidebarLayout>} />
            <Route path='/notifications' element={<SidebarLayout><NotificationScreen /></SidebarLayout>} />
            <Route path='/settings' element={<SidebarLayout><SettingsScreen /></SidebarLayout>} />
            <Route path='/details' element={<TaskDetails />} />
          </>
        ) : (
          // Unauthenticated user flow
          <>
            <Route path="/" element={<SignInScreen />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

// Wrap your app in the Provider component and pass the store
export default function AppWithProvider() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
