import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "./firebase-admin";

export async function verifyAuth(request: Request) {
  initAdmin();
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    throw new Error("Unauthorized");
  }
  return getAuth().verifyIdToken(token);
}

export async function requireRole(request: Request, role: "verified" | "admin") {
  const decoded = await verifyAuth(request);
  const userRole = decoded.role as string | undefined;
  if (userRole !== role && userRole !== "admin") {
    throw new Error("Forbidden");
  }
  return decoded;
}
