import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
import loginRouter from './routes/login.js'
import chatRouter from './routes/chat.js' 
import dashboardRouter from './routes/dashborad.js'
import analysisRouter from './routes/analysis.js'
import personRouter from './routes/person.js'
import signUpRouter from './routes/sginup.js'   
app.use('/api/chat', chatRouter);
app.use('/api/login', loginRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/person', personRouter);
app.use('/api/sign_up', signUpRouter);
export default app;
