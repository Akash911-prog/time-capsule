import { z } from "zod";

const envSchema = z.object({
    FRONTEND_URL: z.url(),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    HOST: z.string(),
    HOST_MAIL: z.email(),
    HOST_PORT: z.coerce.number().default(456),
    APP_PASS: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    NODE_ENV: z.string()
})

export const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error(z.treeifyError(env.error))
    throw new Error("Invalid environment variables")
}

export default env.data