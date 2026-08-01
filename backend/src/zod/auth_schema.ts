import {z} from "zod";

/*We know define the rules to which
each auth schema must adhere to
- clamp username and email to a known limit like 100 characters
- ensure a min password length of 8
- clamp password to a min and max as well */




/*The same min and max clamping is applied for login schemas as well.
These are the only known inputs from the frontend for the time being */