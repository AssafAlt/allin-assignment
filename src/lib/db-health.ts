import prisma from "./prisma";

export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("[DB_CHECK_FAILURE]:", error);
    return false;
  }
}
