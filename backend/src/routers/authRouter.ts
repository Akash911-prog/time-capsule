import { Router } from "express";
import { CreateUserSchema } from "../zodSchemas/userSchemas.js";
import { register } from "../controllers/authControllers.js";
import { validateSchema } from "../middlewares/validateSchemas.js";

const router = Router();

router.post('/register', validateSchema(CreateUserSchema), register);


export default router;