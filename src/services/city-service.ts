import prisma from "@/lib/prisma";
import { CityResponse } from "@/types/city";

export async function getCities(
  search: string,
  page: number = 0,
): Promise<CityResponse[]> {
  const pageSize = 20;
  return await prisma.city.findMany({
    where: {
      cityName: { contains: search, mode: "insensitive" },
    },
    select: {
      cityName: true,
      citySymbol: true,
    },
    take: pageSize,
    skip: page * pageSize,
    orderBy: { cityName: "asc" },
  });
}
