import app from "./app.js"
import prisma from "../prisma/adapter.js";

const port = 3000;

async function start() {
    try {
        await prisma.$connect();
        console.log("Prisma initialized");

        app.listen(port, () => {
            console.log("Listening");
        });
    } catch (e) {
        console.error("Failed to connect:", e);
    }
}

start();