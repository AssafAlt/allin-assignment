import prisma from "@/lib/prisma";
import { PaginatedResponse } from "@/types/service";
import { CityResponse } from "@/types/city";

export async function getCities(
  search: string,
  page: number = 0,
): Promise<PaginatedResponse<CityResponse>> {
  const pageSize = 20;
  const cities = await prisma.city.findMany({
    where: {
      cityName: { contains: search, mode: "insensitive" },
    },
    select: {
      cityName: true,
      citySymbol: true,
    },
    take: pageSize + 1,
    skip: page * pageSize,
    orderBy: { cityName: "asc" },
  });
  const hasMore = cities.length > pageSize;
  const items = hasMore ? cities.slice(0, pageSize) : cities;

  return { items, hasMore };
}
