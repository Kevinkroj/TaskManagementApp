import React from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

function TaskDetails() {
    const location = useLocation();
    const { task } = location.state || {};

    console.log(task);


    return (
        <div>
            <h1 style={{ color: 'black' }}>Welcome to the Example Screen</h1>
        </div>
    );
}

export default TaskDetails;
