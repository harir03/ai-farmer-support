# AgroMitra Backend API

A comprehensive Express.js backend for the AgroMitra farming application, providing RESTful APIs for task management, farm data, and community features.

## Features

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Password hashing with bcrypt
- Profile management
- Role-based access control (farmer, expert, admin)

### 📋 Task Management
- Create, read, update, delete tasks
- Task categorization and prioritization
- Due date tracking and overdue detection
- Task statistics and analytics
- Recurring tasks support

### 🌾 Farm Management
- Field creation and management
- Crop tracking and lifecycle management
- Soil and irrigation information
- Field notes and image attachments
- Location-based field discovery

### 💬 Community Features
- Post creation and management
- Comments and replies system
- Like and share functionality
- Community groups and membership
- Content reporting and moderation

### 🛡️ Security Features
- JWT token authentication
- Password encryption
- Input validation and sanitization
- Rate limiting
- CORS configuration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Express Validator
- **Security**: bcrypt, CORS
- **File Upload**: Multer (configured for Cloudinary)

## Project Structure

```
Backend/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── fieldController.js
│   │   ├── postController.js
│   │   └── communityController.js
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Field.js
│   │   ├── Post.js
│   │   ├── CommunityGroup.js
│   │   └── index.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── fields.js
│   │   ├── posts.js
│   │   └── community.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/               # Utility functions
│   │   ├── helpers.js
│   │   └── dbHelpers.js
│   ├── db/                  # Database configuration
│   │   └── dbConnect.js
│   └── index.js             # Application entry point
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/delete-account` - Delete user account

### Tasks
- `GET /api/tasks` - Get user tasks (with pagination and filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/upcoming` - Get upcoming tasks
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task as complete
- `PATCH /api/tasks/:id/incomplete` - Mark task as incomplete

### Fields
- `GET /api/fields` - Get user fields
- `POST /api/fields` - Create new field
- `GET /api/fields/stats` - Get field statistics
- `GET /api/fields/nearby` - Get fields by location
- `GET /api/fields/:id` - Get field by ID
- `PUT /api/fields/:id` - Update field
- `DELETE /api/fields/:id` - Delete field
- `POST /api/fields/:id/crops` - Add crop to field
- `PUT /api/fields/:fieldId/crops/:cropId` - Update crop
- `POST /api/fields/:id/notes` - Add note to field
- `POST /api/fields/:id/images` - Add image to field

### Posts
- `GET /api/posts` - Get community posts (public)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `POST /api/posts/:postId/comments/:commentId/replies` - Add reply
- `POST /api/posts/:id/share` - Share post
- `POST /api/posts/:id/report` - Report post
- `GET /api/posts/user/my-posts` - Get user's posts

### Community Groups
- `GET /api/community` - Get community groups (public)
- `POST /api/community` - Create new community group
- `GET /api/community/:id` - Get community group by ID
- `PUT /api/community/:id` - Update community group
- `DELETE /api/community/:id` - Delete community group
- `POST /api/community/:id/join` - Join community group
- `POST /api/community/:id/leave` - Leave community group
- `POST /api/community/:groupId/requests/:requestId` - Handle join request
- `GET /api/community/user/my-groups` - Get user's groups

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/agromitra
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Data Models

### User Model
- Personal information (name, email, phone, location)
- Authentication (password, role, verification status)
- Preferences (language, notifications)

### Task Model
- Task details (title, description, due date, priority)
- Status tracking (completed, completion date)
- Categorization and tagging
- Field association
- Recurring task support

### Field Model
- Location and size information
- Soil and irrigation details
- Crop management (planting, harvesting, yield tracking)
- Weather conditions
- Notes and images

### Post Model
- Content and categorization
- Author information
- Engagement (likes, comments, shares)
- Tags and location
- Moderation features

### Community Group Model
- Group information (name, description, category)
- Membership management
- Privacy settings
- Join request handling

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    // Array of items
  ],
  "pagination": {
    "current": 1,
    "pages": 10,
    "total": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Handling

The API includes comprehensive error handling:
- Mongoose validation errors
- Duplicate key errors
- Cast errors (invalid ObjectId)
- JWT authentication errors
- Custom application errors

## Security Features

- **Authentication**: JWT-based authentication with secure token generation
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Express Validator for request validation
- **Rate Limiting**: Basic rate limiting middleware
- **CORS**: Configurable CORS for cross-origin requests
- **Error Sanitization**: Secure error messages without sensitive data

## Development Guidelines

1. **Code Structure**: Follow MVC pattern with clear separation of concerns
2. **Error Handling**: Use consistent error handling middleware
3. **Validation**: Validate all inputs using middleware
4. **Security**: Always authenticate protected routes
5. **Documentation**: Document new endpoints and changes

## Testing

Run tests (when implemented):
```bash
npm test
```

## Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Configure production MongoDB instance
3. **Process Manager**: Use PM2 or similar for production deployment
4. **Reverse Proxy**: Configure nginx or similar for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.