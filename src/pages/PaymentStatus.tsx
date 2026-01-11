import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentStatus() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <p className="font-primary text-base">No payment data found.</p>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 flex justify-center bg-gray-50">
      <div className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md"> {/* wider max-width */}
        
        <h2
          className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center"
          style={{ textShadow: "0 0 8px rgba(90,25,173,0.4)" }}
        >
          🧾 Payment Receipt
        </h2>

        <div className="space-y-3 text-gray-700 text-sm block">
          <div className="flex justify-between">
            <span>Payment ID:</span>
            <span>{state.paymentID}</span>
          </div>
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span>{state.orderID}</span>
          </div>
          <div className="flex justify-between">
            <span>Transaction ID:</span>
            <span>{state.transactionID}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(state.paymentDate).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Payment:</span>
            <span>RM {state.totalPayment}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>{state.paymentMethod}</span>
          </div>

          <p className={`block font-bold text-lg text-center mt-4 ${
            state.paymentStatus === "Payment Complete"
              ? "text-green-600"
              : "text-red-600"
          }`}>
            {state.paymentStatus}
          </p>

          <p className="block text-center mt-2 text-gray-700 text-sm">
            Thank you for your purchase!
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 bg-[#5a19ad] text-white py-3 rounded-xl hover:bg-[#A087C7] transition font-semibold"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
