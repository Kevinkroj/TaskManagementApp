import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { restoreToken, signIn, signOut } from './actions/authActions';
import SidebarLayout from './components/Sidebar';
import Example from './screens/example';

import HomeScreen from './screens/HomeScreen';
import NotificationScreen from './screens/NotificationScreen';
import SignInScreen from './screens/SignInScreen';
import TaskScreen from './screens/Taskassigments';
import store from './store';

function App() {
  const dispatch = useDispatch();
  const { isLoading, userToken } = useSelector((state: any) => state.auth);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (userToken) {
      console.log('User has signed in with token:', userToken);

      setIsSignedIn(true);
    } else if (userToken === null) {
      console.log('eshte logout');
      setIsSignedIn(false);

    }
  }, [userToken]);


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
