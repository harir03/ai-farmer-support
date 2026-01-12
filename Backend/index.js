import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './src/db/dbConnect.js';

// Import routes
import livekitRoutes from './src/routes/livekitToken.route.js';
import authRoutes from './src/routes/auth.js';
import taskRoutes from './src/routes/tasks.js';
import fieldRoutes from './src/routes/fields.js';
import postRoutes from './src/routes/posts.js';
import communityRoutes from './src/routes/community.js';
import farmRoutes from './src/routes/farm.js';
import marketPriceRoutes from './src/routes/marketPrice.js';

// Import middleware
import { errorHandler, notFound, requestLogger } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();

// CORS Configuration - Allow Vercel frontend and localhost for development
const allowedOrigins = [
    'https://ai-farmer-support.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(null, true); // Allow all origins for now, log blocked ones
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);

const PORT = process.env.PORT || 5000;

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'AgroMitra Backend API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/livekit', livekitRoutes);

// API Info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'AgroMitra API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            fields: '/api/fields',
            posts: '/api/posts',
            community: '/api/community',
            farms: '/api/farms',
            marketPrices: '/api/market-prices',
            livekit: '/api/livekit'
        }
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);




connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 AgroMitra Backend Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(`Error connecting to the database: ${error.message}`);
        process.exit(1);
    });