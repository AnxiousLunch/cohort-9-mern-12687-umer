// Route containing authentication routes
import { Router } from "express";
import {register, login, logout} from "../controllers/authControllers.js"
import { validate } from "../middleware/zod_middleware.js";
import { register_schema, login_schema } from "../zod/auth_schema.js";

const router = Router();

router.post("/register", validate(register_schema), register);


router.post("/login", validate(login_schema), login);

router.post("/logout",logout);


export default router;