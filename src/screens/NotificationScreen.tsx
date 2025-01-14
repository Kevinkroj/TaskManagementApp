import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const username = '1user'; // Replace this with dynamic retrieval of the logged-in user's username

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5001/tasks');
                const allTasks = response.data;
                setTasks(allTasks);

                // Filter tasks based on mentions
                const mentionedTasks = allTasks.filter((task: any) => task.mentions && task.mentions.includes(username));
                setFilteredTasks(mentionedTasks);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            }
        };

        fetchTasks();
    }, [username]);

    return (
        <div>
            <h2>Notifications</h2>
            {filteredTasks.length === 0 ? (
                <p>No mentions found.</p>
            ) : (
                <ul>
                    {filteredTasks.map((task: any) => (
                        <li key={task.id}>
                            <h3>{task.title}</h3>
                            <p>{task.comment}</p>
                            <p><small>Deadline: {new Date(task.deadline).toLocaleDateString()}</small></p>
                            <p><small>Status: {task.status}</small></p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationScreen;
