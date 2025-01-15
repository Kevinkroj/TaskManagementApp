import React, { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import '../css/HomeScreen.css';
import totalIMG from '../images/image7.png';
import progressIMG from '../images/image8.png';
import reviewIMG from '../images/image9.png';
import completedIMG from '../images/image10.png';





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
    ChartOptions,
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
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    font: {
                        size: 10,
                        family: 'Krona One',
                    },
                    padding: 10
                },
            },
            title: {
                display: true,
                text: 'Tasks Completed',
                color: 'black',
                font: { wieght: 'bold', size: 22, family: 'Krona One' },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0)', // Set grid lines to white
                },
                ticks: {
                    color: 'black', // Set tick marks to white
                },
                border: {
                    color: 'black', // Set X axis line to white
                },
            },
            y: {
                suggestedMax: Math.max(...completedTasksByMonth) + 2,
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0)', // Set grid lines to white
                },
                ticks: {
                    color: 'black', // Set tick marks to white
                },
                border: {
                    color: 'black', // Set Y axis line to white
                },
            },
        },

    };

    const optionsDounought: ChartOptions<'doughnut'> = {
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    font: {
                        size: 10,
                        family: 'Krona One',
                    },
                    padding: 10
                },

            },
            title: {
                display: true,
                text: 'Current tasks',
                color: 'black',
                font: {
                    size: 22,
                    family: 'Krona One',
                },
                padding: {
                    top: 30,
                    bottom: 10,
                },
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
                borderColor: '#436fce',
                backgroundColor: '436fce)',
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

    function formatDate(dateString: Date) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }


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
                <h1 className='title-dash'>Welcome to the Dashboard</h1>
            </div>

            <div className="card-container">
                <div className="card">
                    <img src={totalIMG} alt="Home Icon" className="link-icon" />
                    <div className='card-inside'>
                        <div className="card-title">Total Tasks</div>
                        <AnimatedNumber targetNumber={totalTask} />
                    </div>
                </div>
                <div className="card">
                    <img src={progressIMG} alt="Home Icon" className="link-icon" />
                    <div className='card-inside'>
                        <div className="card-title">In progress</div>
                        <AnimatedNumber targetNumber={totalTaskInProgress} />
                    </div>
                </div>
                <div className="card">
                    <img src={reviewIMG} alt="Home Icon" className="link-icon" />
                    <div className='card-inside'>
                        <div className="card-title">Under review</div>
                        <AnimatedNumber targetNumber={totalTaskReview} />
                    </div>
                </div>
                <div className="card">
                    <img src={completedIMG} alt="Home Icon" className="link-icon" />
                    <div className='card-inside'>
                        <div className="card-title">Completed</div>
                        <AnimatedNumber targetNumber={totalTaskCompleted} />
                    </div>
                </div>
            </div>

            <div className="content-section">
                <div className="text-section">
                    <Doughnut data={dataDoughnut} options={optionsDounought} />
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
                {/* Main List */}
                <div className="main-list">
                    {/* Header Row */}
                    <div className="header-row">
                        <div className="header-item">Task</div>
                        <div className="header-item">Assigned</div>
                        <div className="header-item">Finished</div>
                        <div className="header-item">Status</div>
                    </div>

                    {/* List Rows */}
                    <ul>
                        {total.slice(0, 5).map((item: any, index: any) => (
                            <li key={index} className="list-item-home">
                                <div className="item-title-home">{item.title}</div>
                                <div className="item-assigned">{formatDate(item.assignedDate)}</div>
                                <div className="item-finished">{formatDate(item.finishedDate)}</div>
                                <div className="item-status">{item.status}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Side List */}
                <div className="side-list">
                    <p>Team Score</p>
                    <ul>
                        {users.slice(0, 5).map((user, index) => (
                            <li key={index}>
                                <div className='user-score'>{user.email}</div>
                                <div className="user-score">
                                    Completed Tasks <span style={{ color: 'green', marginLeft: 20, fontSize: 22 }}>
                                        {user.tasks.filter((task: any) => task.status === 'completed').length}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}

export default HomeScreen;
