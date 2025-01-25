# Tottenham Stadium Frontend

A modern, responsive React application for managing stadium bookings and reservations. This application provides a seamless user experience for booking stadium slots, managing reservations, and handling user authentication.

## 🌟 Features

- User Authentication (Login/Register/Password Reset)
- Email Verification System
- Protected Routes
- Stadium Slot Booking
- Reservation Management
- Responsive Material-UI Design
- JWT Token Authentication
- Real-time Availability Updates

## 🛠️ Tech Stack

- React 18
- Material-UI (MUI)
- React Router v6
- JWT Authentication
- Axios for API calls
- Date-fns for date manipulation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm (v9.0.0 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd frontend-stadium
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment files:

   ```bash
   # .env.development
   REACT_APP_API_URL=http://localhost:8000/api
   NODE_ENV=development

   # .env.production
   REACT_APP_API_URL=https://your-backend-url.com/api
   NODE_ENV=production
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 📦 Building for Production

```bash
npm run build
```

This creates a `build` directory with optimized production files.

## 🌐 Deployment Guide

### Render

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure build settings:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Add environment variables in Render dashboard
5. Deploy

### Vercel

1. Install Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```

3. For production:
   ```bash
   vercel --prod
   ```

### Oracle Cloud

1. Create an Oracle Cloud Infrastructure (OCI) account

2. Set up an Oracle Container Instance:

   ```bash
   # Build Docker image
   docker build -t stadium-frontend .

   # Push to Oracle Container Registry
   docker tag stadium-frontend <region>.ocir.io/<tenancy>/<repo>/stadium-frontend
   docker push <region>.ocir.io/<tenancy>/<repo>/stadium-frontend
   ```

3. Deploy using Oracle Cloud Console:
   - Create a Container Instance
   - Select your pushed image
   - Configure networking and ports
   - Launch instance

### AWS Amplify

1. Install AWS Amplify CLI:

   ```bash
   npm install -g @aws-amplify/cli
   ```

2. Configure Amplify:

   ```bash
   amplify configure
   ```

3. Initialize Amplify in your project:

   ```bash
   amplify init
   ```

4. Deploy:
   ```bash
   amplify push
   amplify publish
   ```

### Netlify

1. Install Netlify CLI:

   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:

   ```bash
   netlify deploy
   ```

3. For production:
   ```bash
   netlify deploy --prod
   ```

## 🔧 Environment Variables

Required environment variables:

```env
REACT_APP_API_URL=<backend-api-url>
NODE_ENV=<development/production>
```

## 📝 Additional Configuration

### CORS Configuration

Ensure your backend CORS settings match your frontend domain:

```javascript
// Example backend CORS configuration
CORS_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://your-production-domain.com",
];
```

### Static File Serving

For hosting services that don't automatically handle client-side routing:

1. Add a `_redirects` file (Netlify):

   ```
   /* /index.html 200
   ```

2. Or add a `vercel.json` (Vercel):
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
