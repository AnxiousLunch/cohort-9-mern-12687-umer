import express, {type Express, type Request, type Response} from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/auth.js"
import { pinoHttp } from "pino-http";
import logger from "./services/logger.js"
import { errorHandler } from "./middleware/error_middleware.js";
import cookieParser from "cookie-parser";
import notesRouter from "./routes/notes.js"

const app: Express = express();
app.use(cors({
  origin: ["http://localhost:5174","http://localhost:5173"],
  credentials: true
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({logger}))

app.get("/health", (req: Request, res: Response) => {
    res.send("Working!");
});

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use(errorHandler);

export default app;

