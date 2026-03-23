import { Router } from "express";
import { CreateUserSchema, LoginUserSchema } from "../zodSchemas/userSchemas.js";
import { login, refresh, register } from "../controllers/authControllers.js";
import { validateSchema } from "../middlewares/validateSchemas.js";

const router = Router();

router.post('/register', validateSchema(CreateUserSchema), register);

router.post('/login', validateSchema(LoginUserSchema), login);

router.get('/refresh', refresh)


export default router;