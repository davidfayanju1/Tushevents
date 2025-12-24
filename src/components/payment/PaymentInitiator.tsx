"use client";

import { useEffect } from "react";
import { usePaystackPayment } from "react-paystack";
import { HookConfig } from "react-paystack/dist/types";

interface PaymentInitiatorProps {
  config: HookConfig;
  onSuccess: (ref: string) => void;
  onClose: () => void;
}

const PaymentInitiator: React.FC<PaymentInitiatorProps> = ({
  config,
  onSuccess,
  onClose,
}) => {
  const initializePayment = usePaystackPayment(config);

  useEffect(() => {
    if (initializePayment) {
      initializePayment({
        onSuccess: (response: { reference: string }) => {
          onSuccess(response.reference);
        },
        onClose,
      });
    }
  }, [initializePayment, onSuccess, onClose]);

  return null;
};

export default PaymentInitiator;
