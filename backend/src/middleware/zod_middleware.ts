import { z } from "zod";
import { type Request, type Response, type NextFunction } from "express";


export const validate = (schema: z.ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({ 
                body: req.body,
                params: req.params,
                query: req.query 
            });
            
            return next();
        } catch (error) {
            return next(error);
        }
    };
};