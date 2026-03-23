import { z } from 'zod';
import { USERNAME_REGEX } from '../constansts.js';

const CreateUserSchema = z.object({
    username: z.string().regex(USERNAME_REGEX),
    email: z.email(),
    password: z.string().min(8)
})

const UserSchema = z.object({
    id: z.uuid(),
    username: z.string().regex(USERNAME_REGEX),
    emailVerifyToken: z.string().nullable().optional(),
    emailVerifyExpiresAt: z.date().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

const LoginUserSchema = z.object({
    username: z.string().regex(USERNAME_REGEX).optional(),
    email: z.email().optional(),
    password: z.string().min(8)
}).refine((data) => data.email || data.username, { message: "Either Email or Username is required" })


type User = z.infer<typeof UserSchema>

type CreateUserBody = z.infer<typeof CreateUserSchema>

type LoginUserBody = z.infer<typeof LoginUserSchema>

export type { CreateUserBody, User, LoginUserBody }
export { CreateUserSchema, UserSchema, LoginUserSchema }