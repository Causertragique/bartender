import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import PaymentForm from "./PaymentForm";
import { useI18n } from "@/contexts/I18nContext";

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export default function PaymentModal({
  isOpen,
  amount,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const { t } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {t.paymentModal.completePayment}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-secondary rounded transition-colors disabled:opacity-50"
            aria-label="Close payment modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Display */}
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase font-medium mb-2">
              {t.paymentModal.totalAmount}
            </p>
            <p className="text-3xl font-bold text-primary">
              ${amount.toFixed(2)}
            </p>
          </div>

          {/* Payment Form */}
          {!isProcessing ? (
            <PaymentForm
              amount={amount}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              onPaymentComplete={onPaymentComplete}
              onCancel={onClose}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                {t.paymentModal.processingPayment}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
