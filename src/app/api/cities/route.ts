import { NextResponse } from "next/server";
import { getCities } from "@/services/city-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const pageStr = searchParams.get("page") || "0";

    const page = parseInt(pageStr);

    if (isNaN(page) || page < 0) {
      return NextResponse.json(
        {
          error: "Invalid input",
          message: "Page must be a non-negative number",
        },
        { status: 400 },
      );
    }

    const cities = await getCities(search, page);

    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch cities" },
      { status: 500 },
    );
  }
}
