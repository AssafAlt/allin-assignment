import { CityResponse } from "@/types/city";
import { PaginatedResponse } from "@/types/service";

const CITY_API_URL = "/api/cities";

interface FetchCitiesArgs {
  term: string;
  page: number;
}

export async function fetchCities({
  term,
  page,
}: FetchCitiesArgs): Promise<PaginatedResponse<CityResponse>> {
  const urlWithParams = `${CITY_API_URL}?page=${page}`;

  const finalUrl = term.trim()
    ? `${urlWithParams}&search=${encodeURIComponent(term)}`
    : urlWithParams;

  const res = await fetch(finalUrl);

  if (!res.ok) throw new Error("Failed to fetch cities");

  return res.json();
}
