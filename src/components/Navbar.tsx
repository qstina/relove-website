import React, { useState, useEffect } from "react";
import { LogIn, LogOut, UserPlus, User, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";

export type Page =
  | "Home"
  | "Products"
  | "Listing"
  | "Login"
  | "Register"
  | "Help"
  | "Profile"
  | "CartPage"
  | "Checkout"
  | "PaymentProcessing"
  | "PaymentStatus"
  | "ApplySeller"
  | "ThankYou"
  | "SellerApplication"
  | "ListUsers";

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const LOGO_URL = "/logo.png";

const Navbar: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, logOut, isAuthReady } = useAuth();
  const { cart } = useCart();
  const [role, setRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRole(data.role || null);
      }
    };
    fetchRole();
  }, [user]);

  const linkClass = (page: Page) =>
    `cursor-pointer transition hover:text-black hover:font-bold hover:text-lg ${
      currentPage === page ? "text-[#5a19ad] font-bold" : "text-gray-600"
    }`;

  const renderLinks = () => (
    <>

      {role === "Admin" ? (
        <a
          onClick={() => {
            onNavigate("ListUsers");
            setMenuOpen(false);
          }}
          className={linkClass("ListUsers")}
        >
          Registered User
        </a>
      ) : (
        <>
          <a
            onClick={() => {
              onNavigate("Products");
              setMenuOpen(false);
            }}
            className={linkClass("Products")}
          >
            Explore Items
          </a>
          {/* Apply Seller link removed per user request */}
        </>
      )}

      {role === "Seller" && (
        <a
          onClick={() => {
            onNavigate("Listing");
            setMenuOpen(false);
          }}
          className={linkClass("Listing")}
        >
          Sell Item
        </a>
      )}

      {role === "Admin" ? (
        <a
          onClick={() => {
            onNavigate("SellerApplication");
            setMenuOpen(false);
          }}
          className={linkClass("SellerApplication")}
        >
          Seller Application
        </a>
      ) : (
        <a
          onClick={() => {
            onNavigate("Help");
            setMenuOpen(false);
          }}
          className={linkClass("Help")}
        >
          Help
        </a>
      )}

      
      <span className="text-gray-400">|</span>

      {isAuthReady ? (
        user && !user.isAnonymous ? (
          <>
            <a
              onClick={() => {
                onNavigate("Profile");
                setMenuOpen(false);
              }}
              className={linkClass("Profile")}
            >
              <User className="inline h-4 w-4 mr-1" /> Profile
            </a>
            <a
              onClick={() => {
                logOut();
                onNavigate("Home");
                setMenuOpen(false);
              }}
              className="cursor-pointer transition text-gray-600 hover:text-red-500"
            >
              <LogOut className="inline h-4 w-4 mr-1" /> Logout
            </a>
          </>
        ) : (
          <>
            <a
              onClick={() => {
                onNavigate("Login");
                setMenuOpen(false);
              }}
              className={linkClass("Login")}
            >
              <LogIn className="inline h-4 w-4 mr-1" /> Login
            </a>
            <a
              onClick={() => {
                onNavigate("Register");
                setMenuOpen(false);
              }}
              className={linkClass("Register")}
            >
              <UserPlus className="inline h-4 w-4 mr-1" /> Register
            </a>
          </>
        )
      ) : (
        <span className="text-gray-500 text-xs">Loading...</span>
      )}
    </>
  );

  return (
    <header
      className={"fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-sm py-4 border-b border-gray-100 " + 
        (role === "Admin" && currentPage === "SellerApplication" ? "bg-purple-900" : "bg-white")}
    >
      <div className="container mx-auto flex justify-between items-center px-4 lg:px-8">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate("Home")}
        >
          <img src={LOGO_URL} alt="re;love" className="h-8 w-auto object-contain" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6 font-secondary text-sm font-medium tracking-wide">
          {renderLinks()}
        </nav>

        {/* Cart + Hamburger */}
        <div className="flex items-center space-x-4">
          {role !== "Admin" && (
            <div className="relative">
              <button
                onClick={() => onNavigate("CartPage")}
                className={`text-2xl transition relative ${
                  currentPage === "CartPage"
                    ? "text-[#5a19ad]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="View Cart"
              >
                <FaShoppingCart />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Hamburger button for mobile */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-900 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden w-full bg-white shadow-md border-t border-gray-200">
          <nav className="flex flex-col space-y-3 px-4 py-4 font-secondary text-sm font-medium">
            {renderLinks()}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
