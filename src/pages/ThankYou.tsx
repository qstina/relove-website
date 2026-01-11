import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, []);
  
  const goHome = () => {
    navigate("/"); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-6">
      <h2
        className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center"
        style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}
      >
        🎉 Thank You !
      </h2>
      <p className="text-gray-700">Your order has been placed successfully.</p>
      <button
        onClick={goHome}
        className="bg-[#B19CD9] text-white px-6 py-3 rounded-xl hover:bg-[#A087C7] transition font-semibold"
      >
        Return to Homepage
      </button>
    </div>
  );
}
