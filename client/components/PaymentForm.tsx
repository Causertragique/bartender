import { useState } from "react";
import { CreditCard, Apple, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  amount: number;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

type PaymentMethod = "card" | "applepay" | null;

export default function PaymentForm({
  amount,
  isProcessing,
  setIsProcessing,
  onPaymentComplete,
  onCancel,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCardChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === "number") {
      formattedValue = value.replace(/\s/g, "").slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, "$1 ").trim();
    } else if (field === "expiry") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue =
          formattedValue.slice(0, 2) + "/" + formattedValue.slice(2);
      }
    } else if (field === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCardData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
    setError("");
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (paymentMethod !== "card") {
      setError("Please select card payment");
      return;
    }

    if (
      !cardData.number ||
      !cardData.expiry ||
      !cardData.cvc ||
      !cardData.name
    ) {
      setError("Please fill in all card details");
      return;
    }

    if (cardData.number.replace(/\s/g, "").length !== 16) {
      setError("Card number must be 16 digits");
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    } catch (err) {
      setError("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleApplePayment = async () => {
    setPaymentMethod("applepay");
    setError("");
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
    } catch (err) {
      setError("Apple Pay failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-green-900/40 rounded-full">
            <Check className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <h3 className="font-semibold text-foreground">Payment Successful!</h3>
        <p className="text-sm text-muted-foreground">
          Thank you for your purchase
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleCardPayment} className="space-y-4">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Choose Payment Method
        </p>

        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={cn(
            "w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 font-medium",
            paymentMethod === "card"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-secondary hover:border-primary/50 text-foreground",
          )}
        >
          <CreditCard className="h-5 w-5" />
          Card Payment
        </button>

        {/* Apple Pay Button */}
        {isApplePayAvailable() && (
          <button
            type="button"
            onClick={handleApplePayment}
            disabled={isProcessing}
            className={cn(
              "w-full p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-3 font-medium",
              "border-border bg-black text-white hover:bg-gray-900 disabled:opacity-50",
            )}
          >
            <Apple className="h-5 w-5" />
            Apple Pay
          </button>
        )}
      </div>

      {/* Card Payment Form */}
      {paymentMethod === "card" && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Card Number
            </label>
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              value={cardData.number}
              onChange={(e) => handleCardChange("number", e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardData.name}
              onChange={(e) => handleCardChange("name", e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) => handleCardChange("expiry", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                CVC
              </label>
              <input
                type="text"
                placeholder="123"
                value={cardData.cvc}
                onChange={(e) => handleCardChange("cvc", e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex gap-2 p-3 bg-destructive/20 rounded-lg border border-destructive/30">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
        {paymentMethod === "card" && (
          <button
            type="submit"
            disabled={isProcessing || !paymentMethod}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Pay ${amount.toFixed(2)}
          </button>
        )}
      </div>

      {/* Test Card Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Test card: 4242 4242 4242 4242 | Any future date | Any CVC
        </p>
      </div>
    </form>
  );
}

function isApplePayAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "ApplePaySession" in window &&
    ApplePaySession?.canMakePayments?.() === true
  );
}
