import { City } from "@/app/generated/prisma/client";

export type CityResponse = Pick<City, "cityName" | "citySymbol">;
