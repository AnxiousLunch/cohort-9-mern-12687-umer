import express, {type Express, type Request, type Response} from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth.js"
import { pinoHttp } from "pino-http";
import logger from "./services/logger.js"

const app: Express = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(helmet());
app.use(pinoHttp({logger}))

app.get("/health", (req: Request, res: Response) => {
    res.send("Working!");
});

app.use("/api/auth", authRouter);

export default app;

