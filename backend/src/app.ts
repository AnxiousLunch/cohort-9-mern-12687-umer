import express, {type Express, type Request, type Response} from "express";
import cors from "cors";
import helmet from "helmet";

const app: Express = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(helmet());

app.get("/health", (req: Request, res: Response) => {
    res.send("Working!");
});



export default app;

