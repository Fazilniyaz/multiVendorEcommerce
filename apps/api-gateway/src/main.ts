import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// import swaggerUi from 'swagger-ui-express';
// import axios from 'axios';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from "./libs/initializeSiteConfig"




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
  keyGenerator: (req: any) => req.ip

});

app.use(limiter);
// ✅ Gateway health — must be before proxy
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

// ✅ Proxy routes — each service has its own prefix
app.use("/", proxy('http://localhost:6001'));

const port = process.env.PORT || 8080;
const server = app.listen(port, async () => {
  console.log(`Listening at http://localhost:${port}`);

  try {
    await initializeSiteConfig();
    console.log("Site config initialized")
  } catch (err) {
    console.error("Error initializing site config", err)
  }

});
server.on('error', console.error);
