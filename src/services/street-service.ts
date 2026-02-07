import prisma from "@/lib/prisma";
import { StreetResponse } from "@/types/street";

export async function getStreetsByCity(
  citySymbol: number,
  search: string = "",
  page: number = 0,
): Promise<StreetResponse[]> {
  const pageSize = 20;
  const cleanSearch = search.trim();

  return await prisma.street.findMany({
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
    take: pageSize,
    skip: page * pageSize,
    orderBy: { streetName: "asc" },
  });
}
