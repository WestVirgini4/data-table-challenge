import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import userRoutes from './routes/users';
import { error, timeStamp } from 'console';


const app = express();
const PORT = process.env.PORT || 3001;
const COR_ORIGIN = process.env.COR_ORIGIN || 'http://localhost:3000';

//middleware
app.use(helmet());
app.use(compression());

//Cors
const allowedOrigins: string[] = [
    'http://localhost:3000',
    'https://data-table-challenge.vercel.app',
    process.env.COR_ORIGIN || ''
].filter(origin => origin !== '');

app.use(cors({
    origin: allowedOrigins,
    credentials : true,
}));

//rate limit
const limiter = rateLimit({
    windowMs : parseInt(process.env.RATE_LIMIT_WINDOW_MS || '90000'), // 15 นาที
    max : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), //limit IP 1000 request
    message : 'Too many request from this IP'
})
app.use('/api',limiter)

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true,limit:'10mb'}));

app.use('/api',userRoutes);
app.use('/dev',userRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Data Table API',
        endpoints: {
            health: '/health',
            users: '/api/users',
            seed: 'POST /dev/seed'
        }
    });
});

app.get('/health', (req ,res) => {
    res.json({status :'OK' , timeStamp: new Date().toISOString()});
});

app.use('*',(req , res) => {
    res.status(400).json({error:'Endpoint not found'})
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoint available at http://localhost:${PORT}/api`);
    console.log(`Seed endpoint: http://localhost:${PORT}/dev/seed`);
})

export default app;