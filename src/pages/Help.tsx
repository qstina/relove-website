import React from "react";

const Help: React.FC = () => (
  <div className="min-h-screen pt-24 pb-16 bg-gray-50">
    <div className="container mx-auto px-4 lg:px-8 max-w-5xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center" style={{ textShadow: '0 0 15px rgba(90,25,173,0.5)' }}>❓ Help & Support</h2>
      <div className="space-y-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm font-secondary">
          <h4 className="font-bold text-gray-800">How do I list an item?</h4>
          <p className="text-gray-600">Go to the "Sell Item" page and fill in details about your product and its story.</p>
        </div>
        <div className="p-4 bg-white border rounded-lg shadow-sm font-secondary">
          <h4 className="font-bold text-gray-800">Is re;love secure?</h4>
          <p className="text-gray-600">Yes, all exchanges are community-based and monitored for safety and trust.</p>
        </div>
      </div>
    </div>
  </div>
);

export default Help;
