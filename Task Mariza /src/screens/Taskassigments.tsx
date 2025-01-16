import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { signIn } from '../actions/authActions';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Task.css';
import editIMG from '../images/image11.png';
import deleteIMG from '../images/image12.png';
import lupeIMG from '../images/image13.png';
import { useTranslation } from 'react-i18next';






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
    const [searchQuery, setSearchQuery] = useState('');
    const [newComment, setNewComment] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const { t }: any = useTranslation();


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
        comments: []
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
            mentions: task.mentions,
            comments: task.comments || []
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


    const [mentions, setMentions] = useState<any>([]);
    const [showMentions, setShowMentions] = useState(false);

    const handleCommentChange = (e: any) => {
        const value = e.target.value;
        setNewComment(value);

        const mentionTriggerIndex = value.lastIndexOf('@');
        if (mentionTriggerIndex >= 0) {
            const mentionText = value.slice(mentionTriggerIndex + 1).trim();
            const matches = users.filter((user: any) => user?.username?.startsWith(mentionText));
            setFilteredUsers(matches);
            setShowMentions(matches.length > 0);
        } else {
            setShowMentions(false);
        }
    };

    const handleMentionClick = (user: any) => {
        const mentionText = `@${user.username} `;
        const updatedComment = newComment.slice(0, newComment.lastIndexOf('@')) + mentionText;
        setNewComment(updatedComment);
        setMentions([...mentions, user]);
        setShowMentions(false);
        setHighlightedIndex(-1); // Reset highlighted index after selecting a mention
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showMentions) return;

        if (e.key === 'ArrowDown') {
            setHighlightedIndex((prev) => (prev + 1) % filteredUsers.length);
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            handleMentionClick(filteredUsers[highlightedIndex]);
        }
    };


    const handleSaveClick = async (taskData: any) => {
        console.log('Saving task:', taskData);

        // Initialize comments array if it is undefined or null
        const updatedComments: any = editedTask.comments || [];

        if (newComment.trim()) {
            // Add the new comment to the task's comments array
            updatedComments.push({
                text: newComment,
                user: taskData.userEmail,
                mentions: mentions,
                date: new Date().toISOString(),
            });

            // Update the task with the new comment
            setEditedTask((prevState: any) => ({
                ...prevState,
                comments: updatedComments,
            }));

            // Clear the new comment input
            setNewComment('');
        }

        const updatedData = {
            ...taskData,
            updatedAt: new Date().toISOString(),
            comments: updatedComments,  // Ensure comments are included in the updated task data
        };

        console.log(updatedData);

        setIsPopupOpen(false);
        try {
            const response = await axios.put(
                `http://localhost:5001/tasks/${updatedData.id}`,
                updatedData
            );
            console.log('Task updated:', response.data);
        } catch (error) {
            console.error('Failed to update task:', error);
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
        console.log(user);

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
            priority: priority,
            userEmail: selectedUser.email,
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


    const [image, setImage] = useState<any>('');

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result;
                // Update the state only if there's a new image
                setImage(base64Image);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) return; // Exit if dropped outside a droppable
        if (destination.droppableId === source.droppableId && destination.index === source.index) return; // Exit if dropped in the same place

        const now = new Date().toISOString();  // Get the current date and time

        const updatedTasks = tasks.map((task: any) => {
            if (task.id === draggableId) {
                return {
                    ...task,
                    status: destination.droppableId,
                    finishedDate: destination.droppableId === 'Completed' ? now : task.finishedDate,
                };
            }
            return task;
        });

        setTasks(updatedTasks); // Update state with modified tasks

        const newEditedTask = {
            ...tasks.find((task: any) => task.id === draggableId),
            status: destination.droppableId,
            finishedDate: destination.droppableId === 'Completed' ? now : tasks.find((task: any) => task.id === draggableId)?.finishedDate,
        };

        setEditedTask(newEditedTask);  // Update editedTask state
        handleSaveClick(newEditedTask);  // Pass newEditedTask directly to handleSaveClick
    };





    const handleSearchChange = (e: any) => {
        if (e) {
            setSearchQuery(e.target.value.toLowerCase());
        }
    };

    const filteredTasks = tasks.filter((task) => {
        const searchLower = searchQuery.toLowerCase();

        return (
            (task.id && task.id.toString().includes(searchLower)) || // Check for id
            (task.userEmail && task.userEmail.toLowerCase().includes(searchLower)) || // Check for assignedTo
            (task.date && new Date(task.date).toLocaleDateString().includes(searchLower)) || // Check for date
            (task.title && task.title.toLowerCase().includes(searchLower)) // Check for name
        );
    });


    const renderTaskItem = (item: any) => (
        <div
            // onClick={() => navigate(`/details`, { state: { task: item } })}
            className="container-task">
            <div className="item-title">#{item.id} - {item.title}</div>

            <div className="assign-text">{t('assignedToLabel1')} {item.userEmail}</div>

            <div>
                {(userID === item.assignedTo || userRole === 'admin') && (
                    <div className="assign-container">
                        <div className="assign-container">
                            <img src={editIMG} alt="edit icon" className="edit-icon" />
                            <div className="edit-text" onClick={() => handleTaskClick(item)}>{t('editTaskTitle1')}</div>
                        </div>
                        <div className="delete-container">
                            <img src={deleteIMG} alt="delete icon" className="delete-icon" />
                            <div className="delete-text" onClick={() => handleDeleteTask(item.id)}>{t('deleteTask')}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );



    return (
        <div className='all-div'>
            <div className='top-div'>
                <div className='search'>
                    <img src={lupeIMG} alt={t('homeIcon')} className="link-icon" />
                    <input value={searchQuery}
                        onChange={handleSearchChange} className='search-input' type="text" placeholder={t('searchPlaceholder')} />
                </div>

                {userRole === 'admin' && (
                    <>
                        <div className='add-button' onClick={handleButtonClick}>
                            {t('newTaskButton')}
                        </div>
                        {dropdownVisible && (
                            <div className="dropdown">
                                {loading ? (
                                    <p>{t('loadingUsers')}</p>
                                ) : error ? (
                                    <p>{t('errorLoadingUsers', { error: error })}</p>
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
                <div className="popup">
                    <div className="popup-content">
                        <h2>{t('popupTitle')}</h2>
                        <p>{t('popupMessage')}</p>
                        <div className="task-form">
                            <p>{selectedUser?.email}</p>
                            <ul>
                                {users.map((user: any) => (
                                    <li key={user.id} onClick={() => handleUserSelect(user)}>
                                        {user.email}
                                    </li>
                                ))}
                            </ul>
                            <input
                                type="text"
                                placeholder={t('taskTitlePlaceholder')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <textarea
                                placeholder={t('taskDescriptionPlaceholder')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />

                            <label>
                                {t('priorityLabel')}:
                                <select
                                    value={editedTask.priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="">{t('selectPriority')}</option>
                                    <option value="Important">{t('importantPriority')}</option>
                                    <option value="Medium">{t('mediumPriority')}</option>
                                    <option value="Low">{t('lowPriority')}</option>
                                </select>
                            </label>
                            <button onClick={handleAddTask}>{t('doneButton')}</button>

                        </div>
                        <button onClick={() => { setOpenAddTask(false) }}>{t('closeButton')}</button>
                    </div>
                </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {['pending', 'In Progress', 'In Review', 'Completed'].map((status) => (
                        <Droppable droppableId={status} key={status}>
                            {(provided) => (
                                <div
                                    style={{ flex: 1, padding: '10px' }}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{status}</h2>
                                    <ul>
                                        {filteredTasks
                                            .filter((task) => task.status === status)
                                            .map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
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
                        <h3>{t('editTaskTitle')}</h3>
                        <label>
                            {t('statusLabel')}:
                            <select
                                value={editedTask.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                            >
                                <option value="in-progress">{t('inProgress')}</option>
                                <option value="review">{t('review')}</option>
                                <option value="completed">{t('completed')}</option>
                            </select>
                        </label>

                        <label>
                            {t('addCommentLabel')}:
                            <textarea
                                value={newComment}
                                onChange={handleCommentChange}
                                onKeyDown={handleKeyDown}
                                placeholder={t('enterNewComment')}
                            />
                        </label>

                        {showMentions && (
                            <ul className="mention-dropdown">
                                {filteredUsers.map((user: any, index: number) => (
                                    <li
                                        key={user.id}
                                        onClick={() => handleMentionClick(user)}
                                        className={index === highlightedIndex ? 'highlighted' : ''}
                                    >
                                        {user.username}
                                    </li>
                                ))}
                            </ul>
                        )}


                        <label>
                            {t('uploadImageLabel')}:
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                        </label>

                        {image && <img src={image} alt="Uploaded preview" />}

                        {/* Only allow full editing if the user is an admin */}
                        {userRole === 'admin' && (
                            <>
                                <label>
                                    {t('titleLabel')}:
                                    <input
                                        type="text"
                                        value={editedTask.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                    />
                                </label>
                                <label>
                                    {t('descriptionLabel')}:
                                    <textarea
                                        value={editedTask.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </label>
                                <label>
                                    {t('deadlineLabel')}:
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
                                    {t('assignedToLabel')}:
                                    <select
                                        value={editedTask.assignedTo}
                                        onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                    >
                                        <option value="">{t('selectUser')}</option>
                                        {users.map((user: any) => (
                                            <option key={user.id} value={user.id}>
                                                {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    {t('priorityLabel')}:
                                    <select
                                        value={editedTask.priority}
                                        onChange={(e) => handleInputChange('priority', e.target.value)}
                                    >
                                        <option value="">{t('selectPriority')}</option>
                                        <option value="Important">{t('importantPriority')}</option>
                                        <option value="Medium">{t('mediumPriority')}</option>
                                        <option value="Low">{t('lowPriority')}</option>
                                    </select>
                                </label>
                            </>
                        )}
                        <div className="popup-actions">
                            <button onClick={() => { handleSaveClick(editedTask) }}>{t('saveButton')}</button>
                            <button onClick={() => setIsPopupOpen(false)}>{t('cancelButton')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

export default TaskScreen;
