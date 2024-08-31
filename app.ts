import { Server } from 'http';
import express from 'express';
import dotenv from "dotenv";
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import database from './config/database';
import mountRoutes from './routes';


const app: express.Application = express()

let server:Server;

dotenv.config();

//Securities
app.use(express.json({limit:'10kb'}))

app.use(cors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
app.use(compression());
app.use(mongoSanitize());
app.use(hpp({ whitelist: ['price', 'category', 'subcategory', 'ratingAvg', 'sold','name'] }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

app.use(express.static('uploads'))

database();

mountRoutes(app);

// app.get('/', function (req:express.Request, res:express.Response) {
//     res.json({message:"hello App!"})
// })

server = app.listen(process.env.PORT,() => {
    console.log(`App is listen on port ${process.env.PORT}`)
})

process.on('unhandledRejection',(err:Error)=>{
    console.error(`unhandledRejection ${err.name} | ${err.message}`);
    server.close(() => {
        console.error('Shutting down the app');
        process.exit(1);
        
    });
});