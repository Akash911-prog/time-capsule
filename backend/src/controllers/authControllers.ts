import type { Request, Response } from "express";
import type { CreateUserBody, LoginUserBody } from "../zodSchemas/userSchemas.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { prisma } from "../lib/prisma.js";
import { refreshTokenExpireTime, SALTROUNDS, verifyEmailExpireDefaultTime } from "../constansts.js";
import { randomBytes } from "crypto";
import { Errors } from "../errors.js";
import { sendEmail } from "../lib/sendEmail.js";
import { Prisma } from "../generated/prisma/client.js";
import env from '../env.js'

async function register(req: Request, res: Response) {

    try {

        const data = req.body as CreateUserBody;

        const salt = await bcrypt.genSalt(SALTROUNDS);
        const hash = await bcrypt.hash(data.password, salt);

        const verifyEmailToken = randomBytes(32).toString('hex');
        const verifyEmailExpiration = new Date(Date.now() + verifyEmailExpireDefaultTime);

        let user;

        try {
            user = await prisma.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    password: hash,
                    emailVerifyToken: verifyEmailToken,
                    emailVerifyExpiresAt: verifyEmailExpiration
                }
            })
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                const fields = err.meta?.target as string[];
                if (fields.includes('email')) {
                    // email taken
                    return res.status(Errors.emailTaken().status).json({ success: false, err: Errors.emailTaken() });
                } else if (fields.includes('username')) {
                    // username taken
                    return res.status(Errors.usernameTaken().status).json({ success: false, err: Errors.usernameTaken() });
                }
            }
            return res.status(Errors.internal().status).json({ success: false, err: Errors.internal() })
        }

        const { password, email, emailVerifyExpiresAt, emailVerifyToken, ...safeUser } = user;

        sendEmail(data.email, verifyEmailToken);

        return res.status(201).json({
            success: true,
            user: safeUser
        })

    } catch (err) {
        console.error('authController [register] : Internal server error: ', err);
        return res.status(Errors.internal().status).json({ failure: true, err: Errors.internal() });
    }
}


async function login(req: Request, res: Response) {
    try {
        const data = req.body as LoginUserBody;

        let user;

        if (data.email) {
            user = await prisma.user.findUnique({
                where: {
                    email: data.email
                }
            })
        }

        else if (data.username) {
            user = await prisma.user.findUnique({
                where: {
                    username: data.username
                }
            })
        }

        if (!user) {
            return res.status(Errors.userNotFound().status).json({ success: false, err: Errors.userNotFound() });
        }

        const isCorrectPassword = await bcrypt.compare(data.password, user.password);

        if (!isCorrectPassword) {
            return res.status(Errors.invalidCredentials().status).json({ success: false, err: Errors.invalidCredentials() })
        }

        const accessToken = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' }
        )

        const refreshToken = randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(refreshToken, SALTROUNDS);

        const refreshTokenDb = await prisma.refreshToken.create({
            data: {
                hashedValue: hashedToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + refreshTokenExpireTime)
            }
        })

        const tokenValue = `${refreshTokenDb.id}.${refreshToken}`

        res.cookie('refreshToken', tokenValue, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshTokenExpireTime
        })

        const { password, email, emailVerifyExpiresAt, emailVerifyToken, ...safeUser } = user;

        return res.status(200).json({ success: true, user: safeUser, accessToken: accessToken });

    } catch (error) {
        console.log("[Error]: Error in login: ", error);
        return res.status(Errors.internal().status).json({ success: false, err: Errors.internal() })
    }
}

async function refresh(req: Request, res: Response) {
    const refreshTokenCookie: string = req.cookies.refreshToken;
    const [tokenId, refreshToken] = refreshTokenCookie.split('.');

    if (!tokenId || !refreshToken) {
        return res.status(403).json({ success: false, err: Errors.forbidden("Invalid Refresh Cookie") })
    }

    const refreshTokenDb = await prisma.refreshToken.findUnique({
        where: {
            id: tokenId
        }
    })

    if (!refreshTokenDb) {
        return res.status(404).json({ success: false, err: Errors.notFound("Refresh Token not found") })
    }

    const isCorrectToken = await bcrypt.compare(refreshToken, refreshTokenDb?.hashedValue);

    if (!isCorrectToken) {
        return res.status(403).json({ success: false, err: Errors.forbidden("Invalid Refresh Token") });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: refreshTokenDb.userId
        }
    })

    if (!user) {
        return res.status(404).json({ success: false, err: Errors.userNotFound() })
    }

    const accessToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    )

    return res.status(200).json({ success: true, accessToken })
}

export { register, login, refresh }