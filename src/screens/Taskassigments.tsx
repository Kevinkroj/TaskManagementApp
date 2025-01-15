import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { signIn } from '../actions/authActions';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Task.css';
import editIMG from '../images/image11.png';
import deleteIMG from '../images/image12.png';
import lupeIMG from '../images/image13.png';





function TaskScreen() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [tasks, setTasks] = useState<any[]>([]);
    const [tasksMerged, setTasksMerged] = useState<any[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [load, setLoad] = useState<any>(null);
    const [userRole, setUserRole] = useState<any>();
    const [userID, setUserID] = useState<any>();
    const [mentionDropdownVisible, setMentionDropdownVisible] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState<any>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [openAddTask, setOpenAddTask] = useState<Boolean>(false);


    const handleKeyDown = (e: any) => {
        if (!mentionDropdownVisible) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault(); // Prevent cursor movement
                setActiveIndex((prevIndex) => (prevIndex + 1) % filteredUsers.length);
                break;
            case 'ArrowUp':
                e.preventDefault(); // Prevent cursor movement
                setActiveIndex((prevIndex) => (prevIndex - 1 + filteredUsers.length) % filteredUsers.length);
                break;
            case 'Enter':
                e.preventDefault(); // Prevent form submission if inside a form
                if (activeIndex >= 0 && filteredUsers.length > 0) {
                    handleMentionSelect(filteredUsers[activeIndex].username);
                }
                break;
            case 'Escape':
                setMentionDropdownVisible(false);
                break;
            default:
                break;
        }
    };

    const [editedTask, setEditedTask] = useState({
        id: '',
        title: '',
        description: '',
        deadline: '',
        assignedTo: '',
        assignedDate: '',
        status: '',
        finishedDate: '',
        userEmail: '',
        priority: '',
        comment: '',
        mentions: [],
    });

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
        setEditedTask({
            id: task.id,
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            assignedTo: task.assignedTo,
            assignedDate: task.assignedDate,
            status: task.status,
            finishedDate: task.finishedDate,
            userEmail: task.userEmail,
            priority: task.priority,
            comment: task.comment,
            mentions: task.mentions
        });
        setIsPopupOpen(true);
    };

    const handleInputChange = (field: string, value: any) => {
        if (field === 'comment') {
            const mentionTriggerIndex = value.lastIndexOf('@');
            if (mentionTriggerIndex >= 0) {
                const mentionText = value.slice(mentionTriggerIndex + 1).trim();
                const matches = users.filter((user: any) => user?.username?.startsWith(mentionText));
                setFilteredUsers(matches);
                setMentionDropdownVisible(matches.length > 0);
            } else {
                setMentionDropdownVisible(false);
            }

            setEditedTask(prev => ({
                ...prev,
                [field]: value,
            }));
        } else {
            setEditedTask(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleMentionSelect = (username: string) => {
        const comment = editedTask.comment || '';
        const mentionTriggerIndex = comment.lastIndexOf('@');
        const beforeMention = comment.slice(0, mentionTriggerIndex);
        const afterMention = comment.slice(mentionTriggerIndex).replace(/@\w*/, `@${username} `);
        setEditedTask(prev => ({
            ...prev,
            comment: `${beforeMention}${afterMention}`
        }));
        setMentionDropdownVisible(false);
    };


    const handleSaveClick = async () => {
        console.log('Saving task:', editedTask);

        const updatedData = {
            ...editedTask,
            updatedAt: new Date().toISOString()
        };

        setIsPopupOpen(false);
        try {
            const response = await axios.put(`http://localhost:5001/tasks/${updatedData.id}`, updatedData);
            console.log('Task added:', response.data);
        } catch (error) {
            console.error('Failed to add task:', error);
        }

        setTasks((prevTasks) => {
            return prevTasks.map((task) =>
                task.id === updatedData.id ? { ...task, ...updatedData } : task
            );
        });
    };




    useEffect(() => {
        const getUsers = async () => {
            try {
                const userRole = localStorage.getItem('userRole');
                const userID = localStorage.getItem('userID');
                setUserID(userID)
                setUserRole(userRole)
                const response = await axios.get('http://localhost:5001/users');
                const data = response.data;
                setUsers(data)

            } catch (error) {
                console.error('Something went wrong, please try again');
            }
        };
        getUsers();
    }, []);


    useEffect(() => {
        const handleTaskCall = async () => {
            try {
                const response = await axios.get('http://localhost:5001/tasks');
                const data = response.data;

                const sortedData = data.sort((a: any, b: any) => {
                    const finishedDateA = new Date(a.assignedDate).getTime();
                    const finishedDateB = new Date(b.assignedDate).getTime();
                    return finishedDateB - finishedDateA;
                });

                console.log('data', sortedData);
                setTasks(sortedData)

            } catch (error) {
                console.error('Something went wrong, please try again');
            }
        };


        handleTaskCall();

        const interval = setInterval(handleTaskCall, 15000);
        return () => clearInterval(interval);
    }, [load]);

    useEffect(() => {
        if (users.length > 0 && tasks.length > 0) {
            const mergedData = tasks.map(task => {
                const user: any = users.find((user: any) => user.id === task.assignedTo);
                return {
                    ...task,
                    userEmail: user ? user.email : 'Unknown User'
                };
            });
            console.log('Merged Data', mergedData);
            setTasksMerged(mergedData)
        }
    }, [users, tasks]);


    const handleButtonClick = () => {
        // setDropdownVisible((prev) => !prev);
        setOpenAddTask(true)

    };

    const handleUserSelect = (user: any) => {
        setSelectedUser(user);
        setDropdownVisible(false); // Hide dropdown after selecting a user
    };

    const handleAddTask = async () => {
        if (!selectedUser || !title || !description || !dueDate || !priority) {
            alert('Please fill in all fields.');
            return;
        }
        const currentDateTime = new Date().toISOString(); // Get current date and time in ISO format
        const deadlineDateTime = new Date(dueDate).toISOString(); // Convert due date to ISO format

        const newTask = {
            title: title,
            description: description,
            assignedTo: selectedUser.id, // Assuming `id` is the unique identifier for the user
            assignedDate: currentDateTime, // Current date when the task is created
            status: "pending", // Default status (adjust as needed)
            finishedDate: null, // Set as null since the task is not completed yet
            deadline: deadlineDateTime, // Selected due date
            priority: priority
        };

        try {
            const response = await axios.post('http://localhost:5001/tasks', newTask);

            setTasksMerged((prevTasks) => [...prevTasks, response.data]);
            setLoad((prevLoad: boolean) => !prevLoad)

        } catch (error) {
            console.error('Something went wrong, please try again');
        }

        console.log('New Task:', newTask); // Replace this with actual task submission logic
    };


    const handleDeleteTask = async (taskId: any) => {
        try {
            // Delete the task from the backend
            await axios.delete(`http://localhost:5001/tasks/${taskId}`);

            // Update the local state by removing the deleted task
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image: any = reader.result;
                handleInputChange('image', base64Image);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragEnd = (result: any) => {
        const { destination, source } = result;

        if (!destination) return;  // If there is no destination, we do nothing

        const { droppableId: destinationStatus } = destination;
        const { droppableId: sourceStatus } = source;

        // Check if the task was moved within the same status group
        if (destinationStatus === sourceStatus && destination.index === source.index) return;

        const updatedTasks: any = [...tasks]; // Create a shallow copy of the tasks

        // Find the dragged task
        const [draggedTask] = updatedTasks.splice(source.index, 1); // Remove the dragged task

        // Update the dragged task's status to the new status
        draggedTask.status = destinationStatus;

        // Insert the dragged task into its new position
        updatedTasks.splice(destination.index, 0, draggedTask);

        // Only update the specific task in the database if needed
        console.log('kush esht kjo', draggedTask);

        console.log('Updated tasks:', updatedTasks);
        setTasks(updatedTasks);  // Update the local task list in state

        setEditedTask({
            id: draggedTask.id,
            title: draggedTask.title,
            description: draggedTask.description,
            deadline: draggedTask.deadline,
            assignedTo: draggedTask.assignedTo,
            assignedDate: draggedTask.assignedDate,
            status: draggedTask.status,
            finishedDate: draggedTask.finishedDate,
            userEmail: draggedTask.userEmail,
            priority: draggedTask.priority,
            comment: draggedTask.comment,
            mentions: draggedTask.mentions
        });


        // Optionally save the updated task to the server
        handleSaveClick();
    };


    const renderTaskItem = (item: any) => (
        <div className='conatiner-task'>
            <div className="item-title">#{item.id} - {item.title}</div>


            <div className='assign-text'>Assigned to {item.userEmail}</div>

            {/* <div className="item-details">
                <span>Assigned Date: {item.assignedDate}</span>
                <span>Finished Date: {item.finishedDate}</span>
                <span>User Assigned: {item.userEmail}</span>
                <span>Status: {item.status}</span>
            </div> */}
            {/* {item.image && (
                <img src={item.image} alt="Task Image" style={{ width: '100px', height: '100px' }} />
            )} */}
            <div>
                {(userID === item.assignedTo || userRole === 'admin') && (
                    <div className='assign-container'>
                        <div className='assign-container'>
                            <img src={editIMG} alt="edit icone" className="edit-icon" />
                            <div className='edit-text' onClick={() => handleTaskClick(item)}>Edit</div>
                        </div>
                        <div className='delete-container'>
                            <img src={deleteIMG} alt="delete icone" className="delete-icon" />
                            <div className='delete-text' onClick={() => handleDeleteTask(item.id)}>Delete</div>
                        </div>
                    </div>
                )}
            </div>

        </div >
    );



    return (
        <div>
            <div className='top-div'>
                <div className='search'>
                    <img src={lupeIMG} alt="Home Icon" className="link-icon" />
                    <input className='search-input' type="text" placeholder="Search..." />
                </div>


                {userRole === 'admin' && (
                    <>
                        <div className='add-button' onClick={handleButtonClick}>+ New Task</div>
                        {dropdownVisible && (
                            <div className="dropdown">
                                {loading ? (
                                    <p>Loading users...</p>
                                ) : error ? (
                                    <p>{error}</p>
                                ) : (
                                    <ul>
                                        {users.map((user: any) => (
                                            <li key={user.id} onClick={() => handleUserSelect(user)}>
                                                {user.email}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {openAddTask && (
                // <div className="task-form">
                //     <p>A {selectedUser.email}</p>
                //     <input
                //         type="text"
                //         placeholder="Task Title"
                //         value={title}
                //         onChange={(e) => setTitle(e.target.value)}
                //     />
                //     <textarea
                //         placeholder="Task Description"
                //         value={description}
                //         onChange={(e) => setDescription(e.target.value)}
                //     />
                //     <input
                //         type="date"
                //         value={dueDate}
                //         onChange={(e) => setDueDate(e.target.value)}
                //     />

                //     <label>
                //         Priority:
                //         <select
                //             value={editedTask.priority}
                //             onChange={(e) => setPriority(e.target.value)}
                //         >
                //             <option value="">Select priority</option>
                //             <option value="Important">Important</option>
                //             <option value="Medium">Medium</option>
                //             <option value="Low">Low</option>
                //         </select>
                //     </label>
                //     <button onClick={handleAddTask}>Done</button>

                // </div>

                <div className="popup">
                    <div className="popup-content">
                        <h2>Pop-Up Title</h2>
                        <p>This is a pop-up message.</p>
                        <button onClick={() => { setOpenAddTask(false) }}>Close</button>
                    </div>
                </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', justifyContent: 'space-between', }}>
                    {['pending', 'inProgress', 'inReview', 'completed'].map((status) => (
                        <Droppable droppableId={status} key={status}>
                            {(provided) => (
                                <div
                                    style={{ flex: 1, padding: '10px' }}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                                    <ul>
                                        {tasks
                                            .filter((task) => task.status === status)
                                            .map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="list-item"
                                                        >
                                                            {renderTaskItem(item)}
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                    </ul>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>


            {isPopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>Edit Task</h3>
                        <label>
                            Status:
                            <select
                                value={editedTask.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <option value="in-progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="completed">Completed</option>
                            </select>
                        </label>
                        <label>
                            Comment:
                            <textarea
                                value={editedTask.comment || ''}
                                onChange={(e) => handleInputChange('comment', e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </label>
                        {mentionDropdownVisible && (
                            <ul className="mention-dropdown">
                                {filteredUsers.map((user: any, index: any) => (
                                    <li
                                        key={user.id}
                                        onClick={() => handleMentionSelect(user.username)}
                                        className={`mention-item ${index === activeIndex ? 'active' : ''}`}
                                    >
                                        {user.username}
                                    </li>
                                ))}
                            </ul>
                        )}


                        <label>
                            Upload Image:
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                        </label>


                        {/* Only allow full editing if the user is an admin */}
                        {userRole === 'admin' && (
                            <>
                                <label>
                                    Title:
                                    <input
                                        type="text"
                                        value={editedTask.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                    />
                                </label>
                                <label>
                                    Description:
                                    <textarea
                                        value={editedTask.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </label>
                                <label>
                                    Deadline:
                                    <input
                                        type="datetime-local"
                                        value={editedTask.deadline.replace('Z', '')}
                                        onChange={(e) => {
                                            const formattedDate = new Date(e.target.value).toISOString();
                                            handleInputChange('deadline', formattedDate);
                                        }}
                                    />
                                </label>
                                <label>
                                    Assigned To:
                                    <select
                                        value={editedTask.assignedTo}
                                        onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                    >
                                        <option value="">Select a user</option>
                                        {users.map((user: any) => (
                                            <option key={user.id} value={user.id}>
                                                {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Priority:
                                    <select
                                        value={editedTask.priority}
                                        onChange={(e) => handleInputChange('priority', e.target.value)}
                                    >
                                        <option value="">Select priority</option>
                                        <option value="Important">Important</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </label>
                            </>
                        )}
                        <div className="popup-actions">
                            <button onClick={handleSaveClick}>Save</button>
                            <button onClick={() => setIsPopupOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}

export default TaskScreen;
