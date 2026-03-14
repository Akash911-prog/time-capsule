import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
const app = express()

app.use(helmet()); // adds all security headers

// cors setup
const FRONTEND_URL = process.env.FRONTEND_URL;
const port = process.env.PORT;

if (!FRONTEND_URL || !port){
  throw new Error("FRONTEND_URL or PORT not accessed");
}

const options: cors.CorsOptions = {
  origin: [FRONTEND_URL]
}
app.use(cors(options));

// json size limit
app.use(express.json({limit: "10kb"}));

// rate limiting
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false
})

app.use(apiLimiter);

// handlers
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/health', (req, res)=>{
  res.send({status: 'ok'});
})

// listener
app.listen(parseInt(port), () => {
  console.log(`Example app listening on port ${port}`)
})
