import express, {type Express, type Request, type Response} from "express";
import prisma from "prisma";
import cors from "cors";

const app: Express = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.send("Working!");
});

export default app;

