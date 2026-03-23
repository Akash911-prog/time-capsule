import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import env from '../env.js'

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter, log: [
    { level: "warn", emit: "event" },
    { level: "info", emit: "event" },
    { level: "error", emit: "event" },
  ],
  errorFormat: 'pretty'
});

prisma.$on("warn", (e) => {
  console.log(e);
});
prisma.$on("info", (e) => {
  console.log(e);
});
prisma.$on("error", (e) => {
  console.log(e);
}); 