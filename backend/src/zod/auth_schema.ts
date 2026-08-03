import {z} from "zod";

/*We know define the rules to which
each auth schema must adhere to
- clamp username and email to a known limit like 100 characters
- ensure a min password length of 8
- clamp password to a min and max as well */

/*The same min and max clamping is applied for login schemas as well.
These are the only known inputs from the frontend for the time being */

export const register_schema = z.object({
    body: z.object({
        username: z.string().min(3).max(100),
        email: z.email().min(3).max(100),
        password: z.string().min(8).max(100)
    })
});

export const login_schema = z.object({
    body: z.object({
        identifier: z.string().min(3).max(100),
        password: z.string().min(8).max(100)
    })
});

export type RegisterInput = z.infer<typeof register_schema>["body"];
export type LoginInput = z.infer<typeof login_schema>["body"];