import { db } from "./server/db.ts";
import { users } from "./shared/schema.ts";

async function createAdminUser() {
  try {
    await db.insert(users).values({
      email: "admin@neuropsicocentro.com.br",
      password: "admin123",
      name: "Admin",
      role: "admin",
      emailVerificado: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

createAdminUser();