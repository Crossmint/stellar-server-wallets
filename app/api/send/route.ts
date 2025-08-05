import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type SendBody = {
  walletAddress: string;
  amount: string;
  token: string;
  recipient: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendBody;

    if (!body.walletAddress || !body.amount || !body.token || !body.recipient) {
      return NextResponse.json(
        { error: "walletAddress, amount, token and recipient are required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const crossmintApiKey = process.env.CROSSMINT_SERVER_API_KEY ?? "";

    if (!crossmintApiKey) {
      throw new Error("CROSSMINT_SERVER_API_KEY environment variable is required");
    }

    const crossmint = createCrossmint({
      apiKey: crossmintApiKey,
    });

    const crossmintWallets = CrossmintWallets.from(crossmint);

    const wallet = await crossmintWallets.getWallet(
      body.walletAddress,
      {
        chain: "stellar",
        signer: {
          type: "email",
        },
      }
    );

    const { transactionId } = await wallet.send(
      body.recipient,
      body.token,
      body.amount,
      {
        experimental_prepareOnly: true,
      }
    );

    console.log(transactionId);

    return NextResponse.json(
      {
        transactionId,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
