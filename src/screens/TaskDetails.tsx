import React from 'react';
import { useLocation, useNavigation } from 'react-router-dom';
import '../css/TaskDetails.css';
import completedIMG from '../images/image10.png';
import { IoArrowBackCircleOutline } from 'react-icons/io5';


function TaskDetails() {
    const location = useLocation();
    const { task } = location.state || {};

    console.log(task);


    if (!task) {
        return <div>Task not found.</div>;
    }

    const {
        title,
        description,
        assignedTo,
        assignedDate,
        status,
        finishedDate,
        deadline,
        priority,
        userEmail,
    } = task;

    return (
        <div className="task-detail-container">
            <h1 className="task-title">#{title}</h1>
            <p className="task-description">{description}</p>

            <div className="task-info">
                <div className="task-item">
                    <strong>Assigned To:</strong> {userEmail}
                </div>
                <div className="task-item">
                    <strong>Assigned Date:</strong> {new Date(assignedDate).toLocaleString()}
                </div>
                <div className="task-item">
                    <strong>Status:</strong> <span className={`status ${status.toLowerCase()}`}>{status}</span>
                </div>
                <div className="task-item">
                    <strong>Deadline:</strong> {new Date(deadline).toLocaleDateString()}
                </div>
                <div className="task-item">
                    <strong>Priority:</strong> <span className={`priority ${priority.toLowerCase()}`}>{priority}</span>
                </div>
                <div className="task-item">
                    <strong>User ID:</strong> {assignedTo}
                </div>

            </div>



            {finishedDate && (
                <div className="task-item">
                    <strong>Finished Date:</strong> {new Date(finishedDate).toLocaleString()}
                </div>
            )}

            <div className="comments">
                <h3 className='comment-details'>Comments</h3>
                {task.comments?.length > 0 ? (
                    task.comments.map((comment: any, index: any) => {
                        const { text, user, mentions, date } = comment; // Destructure the comment object
                        return (
                            <div key={index} className="comment">
                                <p className='details-p'><strong>{user}</strong>: {text}</p>
                                <p className='details-p2'><em>{new Date(date).toLocaleString()}</em></p>
                            </div>
                        );
                    })
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>

        </div>
    );
}

export default TaskDetails;
