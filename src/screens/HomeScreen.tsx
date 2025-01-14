import React, { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { useDispatch } from 'react-redux';
import { signOut } from '../actions/authActions';
import '../css/HomeScreen.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);


function HomeScreen() {
    const dispatch = useDispatch();
    const [totalTask, setTotalTask] = useState(0);
    const [totalTaskInProgress, setTotalTaskInProgress] = useState(0);
    const [totalTaskReview, setTotalTaskReview] = useState(0);
    const [totalTaskCompleted, setTotalTaskCompleted] = useState(0);
    const [completedTasksByMonth, setCompletedTasksByMonth] = useState<number[]>([]);
    const [selectedRange, setSelectedRange] = useState('lastYear');
    const [total, setTotal] = useState([]);
    const [users, setUsers] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);

    const ranges = [
        { value: 'lastYear', label: 'Last Year' },
        { value: 'last6Months', label: 'Last 6 Months' },
        { value: 'last3Months', label: 'Last 3 Months' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'lastWeek', label: 'Last Weeks' },
    ];

    const options = {
        responsive: true,
        elements: {
            line: {
                tension: 0.5,
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Tasks Completed',
                color: 'black',
                font: { wieght: 'bold', size: 22 },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time Period',
                },
            },
            y: {
                suggestedMax: Math.max(...completedTasksByMonth) + 2,
                beginAtZero: true,
            },
        },
    };

    const labels: any = {
        lastYear: [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ],
        last6Months: ['July', 'August', 'September', 'October', 'November', 'December'],
        last3Months: ['October', 'November', 'December'],
        lastMonth: ['December'],
        lastWeek: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    };

    const data = {
        labels: labels[selectedRange],
        datasets: [
            {
                label: 'Completed Tasks',
                data: completedTasksByMonth,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRange(e.target.value);
    };

    useEffect(() => {
        const handleTaskCall = async () => {
            try {
                const userID = localStorage.getItem('userID');
                const userRole = localStorage.getItem('userRole');
                let response;

                if (userRole === 'admin') {
                    response = await axios.get(`http://localhost:5001/tasks`);
                } else {
                    response = await axios.get(`http://localhost:5001/tasks?assignedTo=${userID}`);
                }
                const data = response.data;

                const completedTasks = data.filter((task: any) => task.status === 'completed');
                setTotalTaskInProgress(data.filter((task: any) => task.status === 'in-progress').length);
                setTotalTaskReview(data.filter((task: any) => task.status === 'review').length);
                setTotalTaskCompleted(completedTasks.length);
                setTotalTask(data.length);
                const sortedData = data.sort((a: any, b: any) => {
                    const finishedDateA = new Date(a.finishedDate).getTime();
                    const finishedDateB = new Date(b.finishedDate).getTime();
                    return finishedDateB - finishedDateA;
                });
                setTotal(sortedData)
                setTasks(data)


                const completedTasksFiltered = filterTasksByRange(completedTasks);


                const completedTasksCount = new Array(labels[selectedRange].length).fill(0);
                completedTasksFiltered.forEach((task: any) => {
                    const finishedDate = new Date(task.finishedDate);
                    const index = getLabelIndex(finishedDate);
                    if (index >= 0) completedTasksCount[index]++;
                });

                setCompletedTasksByMonth(completedTasksCount);

            } catch (error) {
                console.error('Something went wrong, please try again');
            }
        };

        handleTaskCall();

        const interval = setInterval(handleTaskCall, 5000);
        return () => clearInterval(interval);
    }, [selectedRange]);


    useEffect(() => {
        if (tasks.length === 0) return;
        const getUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5001/users');
                const usersData = response.data;



                const mergedData = usersData.map((user: any) => {
                    const userTasks = tasks.filter((task: any) => task.assignedTo === user.id);
                    return {
                        ...user,
                        tasks: userTasks
                    };
                });

                const sortedUsers = mergedData.sort((a: any, b: any) => {
                    const completedA = a.tasks.filter((task: any) => task.status === 'completed').length;
                    const completedB = b.tasks.filter((task: any) => task.status === 'completed').length;
                    return completedB - completedA;
                });

                setUsers(sortedUsers);
                console.log('Sorted Users:', sortedUsers);


            } catch (error) {
                console.error('Something went wrong, please try again');
            }
        };

        getUsers();
    }, [tasks]);

    const filterTasksByRange = (tasks: any[]) => {
        const today = new Date();
        let startDate: any;

        switch (selectedRange) {
            case 'last6Months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
                break;
            case 'last3Months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
                break;
            case 'lastMonth':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                break;
            case 'lastWeek':
                startDate = new Date(today.setDate(today.getDate() - 7));
                break;
            default:
                startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        }

        return tasks.filter((task: any) => new Date(task.finishedDate) >= startDate);
    };

    const getLabelIndex = (date: Date) => {
        const today = new Date();
        const month = date.getMonth();
        const weekOfMonth = Math.floor(date.getDate() / 7);

        switch (selectedRange) {
            case 'lastYear':
                return month;
            case 'last6Months':
                return month >= 6 ? month - 6 : month + 6;
            case 'last3Months':
                return month >= 9 ? month - 9 : month + 3;
            case 'lastMonth':
                return 0;
            case 'lastWeek':
                return weekOfMonth;
            default:
                return -1;
        }
    };

    const handleSignOut = () => {
        dispatch(signOut());
        localStorage.removeItem('userToken');
    };

    const AnimatedNumber = ({ targetNumber }: any) => {
        const [count, setCount] = useState(0);

        React.useEffect(() => {
            const interval = setInterval(() => {
                setCount(prevCount => {
                    if (prevCount < targetNumber) {
                        return prevCount + 1;
                    } else {
                        clearInterval(interval);
                        return targetNumber;
                    }
                });
            }, 5);

            return () => clearInterval(interval);
        }, [targetNumber]);

        return <div className="card-number">{count}</div>;
    };

    const dataDoughnut = {
        labels: ['Completed', 'In Progress', 'Under Review'],
        datasets: [
            {
                data: [totalTaskCompleted, totalTaskInProgress, totalTaskReview],
                backgroundColor: ['#36A2EB', '#FF9F40', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF9F40', '#FF6384'],
            },
        ],
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome to the Dashboard { }</h1>
                <button onClick={handleSignOut}>Sign out</button>
            </div>

            <div className="card-container">
                <div className="card">
                    <div className="card-title">Total Tasks</div>
                    <AnimatedNumber targetNumber={totalTask} />
                </div>
                <div className="card">
                    <div className="card-title">Tasks In Progress</div>
                    <AnimatedNumber targetNumber={totalTaskInProgress} />
                </div>
                <div className="card">
                    <div className="card-title">Tasks Under Review</div>
                    <AnimatedNumber targetNumber={totalTaskReview} />
                </div>
                <div className="card">
                    <div className="card-title">Completed Tasks</div>
                    <AnimatedNumber targetNumber={totalTaskCompleted} />
                </div>
            </div>

            <div className="content-section">
                <div className="text-section">
                    <Doughnut data={dataDoughnut} />
                </div>
                <div className="chart-section">
                    <select onChange={handleRangeChange} value={selectedRange}>
                        {ranges.map(range => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                    <Line options={options} data={data} />
                </div>
            </div>

            <div className="list-section">
                <div className="main-list">
                    <p>Main list of items</p>
                    <ul>
                        {total.slice(0, 5).map((item: any, index: any) => {
                            return (
                                <li key={index} className="list-item">
                                    <div className="item-title">{item.title}</div>
                                    <div className="item-details">
                                        <span>Assigned Date: {item.assignedDate}</span>
                                        <span>Finished Date: {item.finishedDate}</span>
                                        <span>Status: {item.status}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="side-list">
                    <p>Smaller side list</p>
                    <ul>
                        {users.slice(0, 5).map((user, index) => (
                            <li key={index}>
                                <p>{user.email}</p>
                                <p>Completed Tasks: {user.tasks.filter((task: any) => task.status === 'completed').length}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;
