import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-[#333333] text-white py-10 font-secondary">
    <div className="container mx-auto px-4 lg:px-8 text-center">
      <h5 className="text-3xl font-primary tracking-widest mb-2">re;love</h5>
      <p className="text-sm text-gray-400">© {new Date().getFullYear()} re;love. All rights reserved.</p>
      <div className="mt-4 space-x-6 text-sm">
        <a href="#" className="hover:text-[#A87A6F] transition">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-[#A87A6F] transition">
          Terms of Service
        </a>
        <a href="#" className="hover:text-[#A87A6F] transition">
          Contact
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;