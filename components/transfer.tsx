"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";

export function TransferFunds() {
  const { wallet } = useWallet();
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);

  async function handleOnTransfer() {
    if (
      wallet == null ||
      recipient == null ||
      amount == null
    ) {
      alert("Transfer: missing required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({
          walletAddress: wallet.address,
          amount: amount.toString(),
          token: "usdc",
          recipient,
        }),
      });

      const data = await response.json();

      const txn = await wallet.approve({
        transactionId: data.transactionId,
      });
      setTxnHash(
        `https://sepolia.basescan.org/tx/${
          typeof txn === "object" ? txn.hash : txn
        }`
      );
    } catch (err) {
      console.error("Transfer: ", err);
      alert("Transfer: " + err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white flex flex-col gap-3 rounded-xl border shadow-sm p-5">
      <div>
        <h2 className="text-lg font-medium">Transfer USDC</h2>
        <p className="text-sm text-gray-500">Send USDC to another wallet</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="0.00"
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Recipient wallet</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Enter wallet address"
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <button
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isLoading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent/80"
          }`}
          onClick={handleOnTransfer}
          disabled={isLoading}
        >
          {isLoading ? "Transferring..." : "Transfer"}
        </button>
        {txnHash && !isLoading && (
          <a
            href={txnHash}
            className="text-sm text-gray-500 text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            → View on Basescan (refresh to update balance)
          </a>
        )}
      </div>
    </div>
  );
}
