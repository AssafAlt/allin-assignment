import { getCities } from "@/services/city-service";
import { apiError, apiSuccess, getSearchParams } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const { search, page } = getSearchParams(request.url);

    if (isNaN(page) || page < 0) {
      return apiError("Page must be a non-negative number", 400);
    }

    const cities = await getCities(search, page);

    return apiSuccess(cities);
  } catch (error) {
    console.error("Cities API Error:", error);
    return apiError("Failed to fetch cities");
  }
}
