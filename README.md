<<<<<<< HEAD
# Animal-Marketplace
Animal Marketplace is a full-stack web application where users can buy, sell, and adopt animals. The platform provides role-based dashboards for Buyers, Sellers, and Admin and includes a real messaging system, search filters, analytics, and multilingual UI.
=======
# Animal Buy & Sell Marketplace

A complete MERN stack application for buying, selling, and adopting animals with role-based access control for buyers, sellers, and administrators.

## Features

### Buyer Features
- Browse and search animals with advanced filters
- View detailed animal listings
- Contact sellers through messaging system
- Leave reviews after purchase or adoption
- User profile management

### Seller Features
- Upload animals with multiple images
- Add detailed information (species, breed, age, gender, price, health status, location)
- Edit and delete own listings
- Manage listings dashboard
- View seller statistics

### Admin Features
- Verify listings before they become public
- Approve or reject animal posts
- Manage users (update roles, verify accounts)
- View comprehensive analytics dashboard
- Delete users (except admins)

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary** for image uploads
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **Vite** for build tooling
- **React Router** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications

## Project Structure

```
Animals/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Cloudinary config
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth context
│   │   └── App.jsx      # Main app
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
ADMIN_EMAIL=ashishc@gmail.com
ADMIN_PASSWORD=abc123456
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `CLOUDINARY_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_SECRET_KEY` - Cloudinary secret key
- `ADMIN_EMAIL` - Admin user email (created automatically)
- `ADMIN_PASSWORD` - Admin user password
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Animals
- `GET /api/animals` - Get all approved animals (with filters)
- `GET /api/animals/:id` - Get single animal
- `POST /api/animals` - Create animal (seller/admin)
- `PUT /api/animals/:id` - Update animal
- `DELETE /api/animals/:id` - Delete animal
- `GET /api/animals/seller/my-animals` - Get seller's animals

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/seller/:id/stats` - Get seller statistics

### Messages
- `POST /api/messages/conversation` - Create/get conversation
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:id` - Get conversation messages
- `GET /api/messages/conversations` - Get all user conversations

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/seller/:id` - Get seller reviews
- `GET /api/reviews/animal/:id` - Get animal reviews

### Admin
- `GET /api/admin/animals/pending` - Get pending animals
- `PUT /api/admin/animals/:id/approve` - Approve animal
- `PUT /api/admin/animals/:id/reject` - Reject animal
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics

## Default Admin Credentials

- Email: `ashishc@gmail.com`
- Password: `abc123456`

The admin user is automatically created on server startup if it doesn't exist.

## Features Implementation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (buyer, seller, admin)
- Protected routes on frontend
- Middleware for backend route protection

### Image Upload
- Cloudinary integration
- Multiple image uploads (up to 5 per animal)
- Automatic image optimization
- Avatar upload for user profiles

### Search & Filter
- Full-text search
- Filter by species, breed, gender, price range, location, category
- Pagination support

### Messaging System
- Real-time conversation management
- Unread message count
- Message history

### Review System
- Rating (1-5 stars)
- Comment support
- One review per buyer per animal
- Reviews visible on animal and seller pages

## Production Deployment

1. Update environment variables with production values
2. Set `NODE_ENV=production`
3. Build frontend: `npm run build` in frontend directory
4. Serve frontend build with a static server or integrate with backend
5. Use a process manager like PM2 for the backend
6. Set up MongoDB Atlas for production database
7. Configure Cloudinary for production

## License

This project is open source and available for use.

## Support

For issues or questions, please create an issue in the repository.


>>>>>>> 05ecdd1 (chore: add .gitignore and .env.example)
