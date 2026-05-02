import bcrypt from "bcrypt";
import jwt, { type Secret } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; email: string } {
  try {
    const payload = (jwt.verify as any)(token, JWT_SECRET) as {
      userId: number;
      email: string;
    };
    if (!payload?.userId || !payload?.email) {
      throw new Error("Invalid token payload");
    }
    return payload;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
