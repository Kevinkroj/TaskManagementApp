import React from 'react';
import { useDispatch } from 'react-redux';
import { signOut } from '../actions/authActions';

function Example() {
    const dispatch = useDispatch();

    const handleSignOut = () => {
        console.log('heyeyeyeyye');

    };

    return (
        <div>
            <h1>Welcome to the Example Screen</h1>
            <button onClick={handleSignOut}>ik</button>
        </div>
    );
}

export default Example;
