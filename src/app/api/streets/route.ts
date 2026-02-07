import { NextResponse } from "next/server";
import { getStreetsByCity } from "@/services/street-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const citySymbolStr = searchParams.get("citySymbol");
    const search = searchParams.get("search") || "";
    const pageStr = searchParams.get("page") || "0";

    const citySymbol = parseInt(citySymbolStr || "");
    if (isNaN(citySymbol)) {
      return NextResponse.json(
        {
          error: "Invalid input",
          message: "citySymbol must be a valid number",
        },
        { status: 400 },
      );
    }

    const page = parseInt(pageStr);
    if (isNaN(page) || page < 0) {
      return NextResponse.json(
        {
          error: "Invalid input",
          message: "page must be a non-negative number",
        },
        { status: 400 },
      );
    }

    const streets = await getStreetsByCity(citySymbol, search, page);
    return NextResponse.json(streets, { status: 200 });
  } catch (error) {
    console.error("Street API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch streets" },
      { status: 500 },
    );
  }
}
