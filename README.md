# TaskManagementApp

# Task Trail
Task Trail is a task management app built with React JS and TypeScript, designed to help teams stay organized and collaborate efficiently. It features advanced task management capabilities, including task creation, updating, deletion, and assignment, all with a dynamic interface. The app supports real-time updates, advanced search and filtering, task collaboration, and robust reporting and analytics. Additionally, it is built with responsiveness in mind to ensure a seamless user experience on all devices.
## Features ##
**User Authentication and Authorization:** Simulated authentication with role-based access control (RBAC) and JWT for secure login and user management.
**Dashboard and Task Views:** Dynamic and customizable dashboard with multiple task views such as list, grid, and calendar.
**Task Management:** Create, update, delete, assign, and prioritize tasks, with drag-and-drop functionality.
**Real-time Updates:** Simulated real-time task updates to keep all users synchronized.
**Task Collaboration:** Enable team members to collaborate on tasks through comments, file attachments, and mentions.
**Reporting and Analytics:** Generate reports and analytics to monitor task performance and team efficiency.
**Internationalization and Localization:** Support for multiple languages and locales, including date format and text translations.
**Responsive Design:** Fully responsive design for all device sizes to ensure seamless user experience.
## Tech Stack ##
**Frontend:** React JS, TypeScript
**State Management:** Redux Toolkit
**Routing:** React Router DOM
**Authentication:** Simulated JWT for authentication and authorization (json-server-auth)
**Backend Simulation:** JSON Server for handling authentication and task data
## Features Walkthrough
**Authentication**
Users can log in using a simulated authentication mechanism. Once logged in, they can access their dashboard and tasks.
Role-based access control ensures different users (e.g., admin, team member) have different levels of access.
**Dashboard**
The dashboard is dynamic and can switch between different views (list, grid, calendar) for task management.
Tasks are displayed based on their due dates, priorities, and assignments.
**Task Management**
Users can create, update, delete, and assign tasks, with the option to prioritize them.
Tasks can be dragged and dropped for easy prioritization and reorganization.
**Task Collaboration**
Each task supports comments, file attachments, and mentions, facilitating team collaboration.
**Search and Filtering**
The search functionality allows users to filter tasks.
**Internationalization**
The app supports multiple languages, and dates are displayed based on the user's locale settings.
**Responsiveness**
The design ensures that the app is fully responsive, providing a smooth user experience on mobile devices, tablets, and desktops.
## Installation
Install the application dependencies by running:
```bash
npm install
```
## Development
Start the application in development mode with:
```bash
npm start
```

## Server Installation
Install the server dependencies by running:
```bash
npm install -D json-server json-server-auth
```
## Development
Start the server in development mode with:
```bash
json-server-auth db.json --port 5001
```


## Credentials
```bash
admin@task.al
12345678
```

```bash
normaluser@user.com
12345678
```

