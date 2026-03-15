import type { Request, Response } from "express";
import type { CreateUserBody } from "../zodSchemas/userSchemas.js";

async function register(req: Request, res: Response) {
    const data = req.body as CreateUserBody;


}

export { register }