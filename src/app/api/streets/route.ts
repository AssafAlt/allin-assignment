import { getStreetsByCity } from "@/services/street-service";
import { apiError, apiSuccess, getSearchParams } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const { search, page, citySymbol } = getSearchParams(request.url);
    if (isNaN(citySymbol)) {
      return apiError("citySymbol must be a valid number", 400);
    }
    if (isNaN(page) || page < 0) {
      return apiError("page must be a non-negative number", 400);
    }

    const streets = await getStreetsByCity(citySymbol, search, page);
    return apiSuccess(streets);
  } catch (error) {
    console.error("Street API Error:", error);
    return apiError("Failed to fetch streets");
  }
}
