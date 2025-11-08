import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

interface ValidationError {
    field: string;
    message: string;
}

export const validateBody = <T>(schema: z.ZodType<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: ValidationError[] = error.issues.map((issue) => ({
                field: issue.path[0]?.toString() || "unknown",
                message: issue.message,
        }));
            return res.status(400).json({ errors });
        }
        return res.status(500).json({ message: "Erro interno no servidor" });
    };
}
}