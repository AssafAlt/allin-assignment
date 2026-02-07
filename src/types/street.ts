import { Street } from "@/app/generated/prisma/client";

export type StreetResponse = Pick<Street, "streetName" | "streetSymbol">;
