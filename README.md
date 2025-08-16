# URL Shortener - Professional URL Shortening Service

A comprehensive URL shortening service built with Node.js, Express, MongoDB, and React. Features include user authentication, analytics tracking, QR code generation, password protection, and custom aliases.

## 🚀 Features

### Core Functionality
- **URL Shortening**: Create short, memorable links from long URLs
- **Custom Aliases**: Set your own custom short URLs
- **QR Code Generation**: Generate QR codes for easy mobile sharing
- **Password Protection**: Secure your links with passwords
- **Expiration Dates**: Set automatic expiration for temporary links

### Analytics & Tracking
- **Click Tracking**: Monitor total clicks and unique visitors
- **Device Analytics**: Track desktop, mobile, and tablet usage
- **Browser Analytics**: Monitor browser preferences
- **Geographic Data**: View visitor locations
- **Referrer Tracking**: See where traffic comes from
- **Time Series Data**: Analyze trends over time

### User Management
- **User Authentication**: Secure signup and login system
- **Dashboard**: Manage all your shortened URLs
- **Search & Filter**: Find specific URLs quickly
- **Bulk Management**: Edit and delete multiple URLs

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **QRCode** - QR code generation
- **geoip-lite** - IP geolocation
- **ua-parser-js** - User agent parsing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Chart components
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
URL/
├── server/                 # Backend server
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── package.json       # Backend dependencies
│   └── index.js           # Server entry point
├── client/                # Frontend application
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── index.html         # HTML template
├── package.json           # Root package.json
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd URL
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install

# Or use the convenience script
npm run install-all
```

### 3. Environment Setup
```bash
# Copy environment template
cp server/env.example server/.env

# Edit .env file with your configuration
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/url-shortener
# JWT_SECRET=your-super-secret-jwt-key-here
# JWT_EXPIRE=7d
# NODE_ENV=development
```

### 4. Start MongoDB
```bash
# Start MongoDB service
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Run the Application
```bash
# Development mode (both frontend and backend)
npm run dev

# Or run separately
npm run server    # Backend only
npm run client    # Frontend only
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### URL Management
- `POST /api/urls` - Create shortened URL
- `GET /api/urls` - Get user's URLs
- `GET /api/urls/:id` - Get specific URL
- `PUT /api/urls/:id` - Update URL
- `DELETE /api/urls/:id` - Delete URL

### Analytics
- `GET /api/analytics/url/:urlId` - Get URL analytics
- `GET /api/analytics/dashboard` - Get dashboard stats

### URL Redirection
- `GET /:shortId` - Redirect to original URL
- `POST /:shortId/verify-password` - Verify password for protected URLs

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/url-shortener |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `NODE_ENV` | Environment mode | development |

### MongoDB Collections
- **users** - User accounts and authentication
- **urls** - Shortened URLs and metadata
- **analytics** - Click tracking and visitor data

## 🎨 Customization

### Styling
The application uses Tailwind CSS with a custom design system. You can customize:
- Colors in `client/src/index.css`
- Component styles in `client/tailwind.config.js`
- Layout and spacing throughout components

### Features
- Add new analytics metrics in `server/models/Analytics.js`
- Extend URL options in `server/models/Url.js`
- Create new API endpoints in the routes directory

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your hosting service
3. Ensure MongoDB is accessible
4. Configure CORS origins for production

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API base URLs for production

### Docker Deployment
```dockerfile
# Example Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify MongoDB connection
3. Check environment variables
4. Review the API documentation above

## 🔮 Future Enhancements

- [ ] Bulk URL import/export
- [ ] Advanced analytics filters
- [ ] API rate limiting
- [ ] Webhook notifications
- [ ] Team collaboration features
- [ ] Custom domain support
- [ ] A/B testing for URLs
- [ ] Social media integration

---

Built with ❤️ using modern web technologies
