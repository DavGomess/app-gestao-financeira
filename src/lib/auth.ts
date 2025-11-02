import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface TokenPayload extends JwtPayload {
    email: string;
    id: number;
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
    return await bcrypt.compare(password, hashed);
}

export function generateToken(payload: TokenPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch {
        return null;
    }
}
