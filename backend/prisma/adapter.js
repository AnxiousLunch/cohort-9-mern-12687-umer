import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import dotenv from "dotenv";
import process from "process";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaMariaDb(databaseUrl); 
const prisma = new PrismaClient({ adapter, log: ["query", "info", "warn", "error"], });

export default prisma;   