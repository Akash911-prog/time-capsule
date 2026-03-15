import { z } from 'zod';

const CreateUserSchema = z.object({
    username: z.string().min(1),
    email: z.email(),
    password: z.string().min(8)
})


const UserSchema = z.object({
    id: z.uuid(),
    username: z.string(),
    emailVerifyToken: z.string().nullable().optional(),
    emailVerifyExpiresAt: z.date().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

type User = z.infer<typeof UserSchema>

type CreateUserBody = z.infer<typeof CreateUserSchema>

export type { CreateUserBody, User }
export { CreateUserSchema, UserSchema }