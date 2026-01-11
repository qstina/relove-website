import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentProcessing() {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate mock payment details
      const paymentData = {
        paymentID: Math.floor(Math.random() * 100000),
        orderID: Math.floor(Math.random() * 100000),
        transactionID: "TXN-" + Date.now(),
        paymentDate: new Date().toISOString(),
        totalPayment: state.totalPayment,
        paymentMethod: state.paymentMethod,
        paymentStatus: "Payment Complete",
      };

      navigate("/payment-status", { state: paymentData });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, state]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Processing Payment...</h2>
      <p>Please wait while we confirm your order.</p>

      <div className="mt-6 animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#B19CD9]"></div>
    </div>
  );
}
