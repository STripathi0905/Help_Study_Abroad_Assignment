# Help Study Abroad - Kanban Board Backend

## Overview

This is the backend server for the Help Study Abroad Kanban board application. It provides RESTful API endpoints and real-time Socket.IO communication for the frontend application.

## Tech Stack

- **Server Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO
- **Testing**: Jest with Supertest

## Features

- **RESTful API**: Complete CRUD operations for tasks, boards, and users
- **Real-time Updates**: Socket.IO integration for live collaboration
- **Data Persistence**: MongoDB storage for all application data
- **Error Handling**: Comprehensive error handling and validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/kanban
   CLIENT_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm start
   ```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get a specific board
- `POST /api/boards` - Create a new board
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Socket.IO Events

### Client to Server
- `join-board` - User joins a board
- `leave-board` - User leaves a board
- `task-moved` - Task moved between columns
- `task-created` - New task created
- `task-updated` - Task details updated
- `task-deleted` - Task removed from board

### Server to Client
- `user-joined` - Notify when a user joins the board
- `user-left` - Notify when a user leaves the board
- `task-moved` - Broadcast task movement to all users
- `task-created` - Broadcast new task to all users
- `task-updated` - Broadcast task updates to all users
- `task-deleted` - Broadcast task deletion to all users
- `active-users` - Send list of active users on the board

## Project Structure

- `/models` - Mongoose models for database entities
- `/routes` - Express routes for API endpoints
- `/server.js` - Main server file with Express and Socket.IO setup

## Testing

Run tests with Jest:

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.