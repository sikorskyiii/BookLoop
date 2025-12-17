import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    req.userId = payload.sub as string;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

