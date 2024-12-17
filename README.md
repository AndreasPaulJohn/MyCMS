# MyCMS

A modern Content Management System built with React, Node.js, and PostgreSQL.

## Features

- User authentication and authorization
- Content management capabilities
- File upload functionality
- Admin dashboard
- Responsive design
- RESTful API
- PostgreSQL database integration

## Setup

### Prerequisites

- Node.js
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AndreasPaulJohn/MyCMS.git
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
- Create a `.env` file in the server directory
- Add necessary environment variables (see `.env.example`)

4. Start the development servers:
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm start
```

## Project Structure

```
MyCMS/
├── client/          # React frontend
├── server/          # Node.js backend
└── docs/            # Documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.