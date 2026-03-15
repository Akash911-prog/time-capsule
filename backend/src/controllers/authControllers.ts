import type { Request, Response } from "express";
import type { CreateUserBody } from "../zodSchemas/userSchemas.js";
import bcrypt from 'bcrypt';
import { prisma } from "../lib/prisma.js";
import { SALTROUNDS, verifyEmailExpireDefaultTime } from "../constansts.js";
import { randomBytes } from "crypto";
import { Errors } from "../errors.js";

async function register(req: Request, res: Response) {
    const data = req.body as CreateUserBody;

    const existingUserByEmail = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    })

    if (existingUserByEmail) {
        res.status(Errors.emailTaken().status).json({ failure: true, message: 'user with this email already exists', err: Errors.emailTaken() })
    }

    const existingUserByUsername = await prisma.user.findUnique({
        where: {
            username: data.username
        }
    })

    if (existingUserByEmail) {
        res.status(Errors.usernameTaken().status).json({ failure: true, message: 'user with this email already exists', err: Errors.usernameTaken() })
    }

    const salt = await bcrypt.genSalt(SALTROUNDS);
    const hash = await bcrypt.hash(data.password, salt);

    const verifyEmailToken = randomBytes(32).toString('hex')
    const verifyEmailExpiration = new Date(Date.now() + verifyEmailExpireDefaultTime);

    const user = await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: hash,
            emailVerifyToken: verifyEmailToken,
            emailVerifyExpiresAt: verifyEmailExpiration
        }
    })

    const { password, email, ...safeUser } = user;

    return res.status(200).json({
        success: true,
        user: safeUser
    })

}

export { register }