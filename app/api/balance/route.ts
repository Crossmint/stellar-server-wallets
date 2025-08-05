import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { walletAddress } = body;

  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const url = `https://staging.crossmint.com/api/2025-06-09/wallets/${walletAddress}/balances?chain=stellar&tokens=usdc`;
  const options = {
    method: "GET",
    headers: { "X-API-KEY": process.env.CROSSMINT_SERVER_API_KEY ?? "" },
    body: undefined,
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
  }
}
