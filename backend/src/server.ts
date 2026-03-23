import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

import env from './env.js'
import { errorHandler } from './errors.js'
import authRouter from './routers/authRouter.js'


function start_server(): void {

  const app = express()

  app.use(helmet()); // adds all security headers

  // cors setup
  const options: cors.CorsOptions = {
    origin: [env.FRONTEND_URL]
  }
  app.use(cors(options));

  // json size limit
  app.use(express.json({ limit: "10kb" }));

  // rate limiting
  const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  })

  app.use(apiLimiter);

  app.use(cookieParser())

  // handlers
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.get('/health', (req, res) => {
    res.send({ status: 'ok' });
  })

  app.use('/auth', authRouter)


  app.use(errorHandler);

  // listener
  app.listen(env.PORT, () => {
    console.log(`Example app listening on port ${env.PORT}`)
  })

}

start_server();