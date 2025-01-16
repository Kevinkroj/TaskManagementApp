import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const username = 'admin'; // Logged-in user's username
    const [expandedTask, setExpandedTask] = useState<number | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('http://localhost:5001/tasks');
                const allTasks = response.data;
                setTasks(allTasks);

                console.log(allTasks);

                // Filter tasks based on mentions in the comments
                const mentionedTasks = allTasks.filter((task: any) =>
                    task.comments && task.comments.some((comment: any) =>
                        comment.mentions && comment.mentions.some((mention: any) => mention.username === username)
                    )
                );
                setFilteredTasks(mentionedTasks);

                console.log(mentionedTasks);

            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            }
        };

        fetchTasks();
    }, [username]);

    const toggleTaskDetails = (taskId: number) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };

    return (

        <div>
            <h2>Notifications</h2>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {filteredTasks.map((task: any) => (
                    <li
                        key={task.id}
                        style={{
                            background: 'rgba(193, 193, 193, 0.5)',
                            marginBottom: '10px',
                            padding: '15px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <p >{task.title}</p>
                            <button
                                onClick={() => toggleTaskDetails(task.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    color: "#436fce",
                                }}
                            >
                                {expandedTask === task.id ? '▲' : '▼'}
                            </button>
                        </div>

                        {expandedTask === task.id && (
                            <div style={{ marginTop: '10px' }} >

                                {task.comments.map((comment: any, index: number) => (
                                    <div key={index}>
                                        {/* Show the comment text */}
                                        <p className='user-score'>{comment.text}</p>
                                        {/* Show mentions in the comment */}
                                        {comment.mentions && comment.mentions.length > 0 && (
                                            <ul>
                                                {comment.mentions.map((mention: any, mentionIndex: number) => (
                                                    <li key={mentionIndex}>
                                                        <strong>{mention.username}</strong> mentioned you.
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}

                                <p className='user-score'>
                                    <small>Date: {new Date(task.deadline).toLocaleDateString()}</small>
                                </p>
                                <p className='user-score'>
                                    <small>Status: {task.status}</small>
                                </p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationScreen;
