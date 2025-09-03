# Help Study Abroad - Kanban Board Application

## Overview

Help Study Abroad is a real-time collaborative Kanban board application designed to help teams manage tasks efficiently. The application consists of a Next.js frontend and an Express.js backend with Socket.IO for real-time updates.

## Features

- **Real-time Collaboration**: Multiple users can work on the same board simultaneously with live updates
- **Drag and Drop Interface**: Intuitive task management with drag-and-drop functionality
- **Task Management**: Create, edit, and delete tasks with detailed information
- **Task Properties**: Assign priority, tags, due dates, and team members to tasks
- **Filtering & Searching**: Filter tasks by priority, assignee, tags, and search by text
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Connection Status**: Visual indicators for connection status
- **Notifications**: System notifications for important events

## Tech Stack

### Frontend
- **Framework**: Next.js 15.4
- **UI Library**: React 19.1
- **State Management**: Redux Toolkit
- **Styling**: TailwindCSS 4
- **Drag and Drop**: @hello-pangea/dnd
- **Real-time Communication**: Socket.IO Client
- **Date Handling**: date-fns
- **Testing**: Jest, React Testing Library

### Backend
- **Server**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (planned)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/kanban
   CLIENT_URL=http://localhost:3000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend-assign
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000/kanban](http://localhost:3000/kanban) in your browser

## Project Structure

### Frontend

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/redux` - Redux store, slices, and actions
- `/src/services` - API and Socket.IO services
- `/src/context` - React context providers

### Backend

- `/models` - Mongoose models
- `/routes` - Express routes
- `/server.js` - Main server file with Socket.IO setup

## Socket.IO Events

- `join-board` - User joins a board
- `leave-board` - User leaves a board
- `task-moved` - Task moved between columns
- `task-created` - New task created
- `task-updated` - Task details updated
- `task-deleted` - Task removed from board

## Testing

### Frontend Tests

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

### Backend Tests

```bash
cd backend
npm test
```

## Future Enhancements

- User authentication and authorization
- Multiple board support
- Activity log and history
- File attachments for tasks
- Custom board templates
- Dark mode support
- Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
