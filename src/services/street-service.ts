import prisma from "@/lib/prisma";
import { PaginatedResponse } from "@/types/service";
import { StreetResponse } from "@/types/street";

export async function getStreetsByCity(
  citySymbol: number,
  search: string = "",
  page: number = 0,
): Promise<PaginatedResponse<StreetResponse>> {
  const pageSize = 20;
  const cleanSearch = search.trim();

  const streets = await prisma.street.findMany({
    where: {
      citySymbol: citySymbol,
      streetName: {
        contains: cleanSearch,
        mode: "insensitive",
      },
    },
    select: {
      streetName: true,
      streetSymbol: true,
    },
    take: pageSize + 1,
    skip: page * pageSize,
    orderBy: { streetName: "asc" },
  });
  const hasMore = streets.length > pageSize;
  const items = hasMore ? streets.slice(0, pageSize) : streets;

  return { items, hasMore };
}
