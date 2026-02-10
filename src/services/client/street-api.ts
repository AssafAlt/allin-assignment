import { PaginatedResponse } from "@/types/service";
import { StreetResponse } from "@/types/street";

const STREET_API_URL = "/api/streets";

interface FetchStreetsArgs {
  citySymbol: number | null;
  term: string;
  page: number;
}

export async function fetchStreets({
  citySymbol,
  term,
  page,
}: FetchStreetsArgs): Promise<PaginatedResponse<StreetResponse>> {
  if (!citySymbol) return { items: [], hasMore: false };

  const urlWithParams = `${STREET_API_URL}?citySymbol=${citySymbol}&page=${page}`;

  const finalUrl = term.trim()
    ? `${urlWithParams}&search=${encodeURIComponent(term)}`
    : urlWithParams;

  const res = await fetch(finalUrl);

  if (!res.ok) throw new Error("Failed to fetch streets");

  return res.json();
}
