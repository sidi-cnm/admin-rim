// scripts/register.ts
import { registerUser } from "./register.service";

const admin = { name: "admin" }; // bypass cookies, puisque hors HTTP

const body = {
  email: `test-${Date.now()}@example.com`,
  password: "123456",
  contact: "22241234567",
  samsar: false,
  roleName: "client",
  roleId: "2",
  isActive: true,
};

const result = await registerUser(body, admin);

if (!result.ok) {
  console.error("❌ FAIL", result.status, result.error);
  process.exit(1);
}

console.log("✅ OK", result.data.user);
console.log("JWT:", result.data.token.slice(0, 40) + "...");
