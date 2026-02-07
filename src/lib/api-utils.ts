import { NextResponse } from "next/server";

export function getSearchParams(url: string) {
  const { searchParams } = new URL(url);

  return {
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page") || "0"),
    citySymbol: parseInt(searchParams.get("citySymbol") || ""),
  };
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(
  message: string,
  status: number = 500,
  error?: string,
) {
  return NextResponse.json(
    {
      error:
        error || (status === 400 ? "Invalid input" : "Internal Server Error"),
      message,
    },
    { status },
  );
}
