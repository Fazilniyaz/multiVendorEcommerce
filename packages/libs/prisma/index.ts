import { PrismaClient } from "../../../generated/prisma/index.js";

declare global {
    var prismadb: PrismaClient;
}

const prisma = new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prismadb = prisma

export default prisma