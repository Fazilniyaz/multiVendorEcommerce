import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
// import swaggerUi from 'swagger-ui-express';
// import axios from 'axios';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import router from './routes/product.routes';
// import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger-output.json";

// const swaggerDocument = require("./swagger-output.json");

// const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4200'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: any) => ipKeyGenerator(req)
});

app.use(limiter);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/product-service-health', (req, res) => {
  res.send({ 'message': 'Hello PRODUCT API' });
});

app.use("/api", router);
// app.get("/docs-json", (req, res) => {
//   res.json(swaggerDocument);
// });
app.use(errorMiddleware); //  Global error handler

const server = app.listen(port, () => {
  console.log(`Product Service, Listening at http://localhost:${port}/product`);
  console.log(`Swagger Docs available at http://localhost:${port}/product-docs`)
});
server.on('error', (err) => {
  console.error('Server error:', err);

});
