import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Listing from "./pages/Listing";
import Login from "./pages/Login";
import * as RegisterModule from "./pages/Register";
const Register = RegisterModule.default || RegisterModule;
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import PaymentProcessing from "./pages/PaymentProcessing";
import PaymentStatus from "./pages/PaymentStatus";
import ThankYou from "./pages/ThankYou";
import ApplySeller from "./pages/ApplySeller";
import SellerApplication from "./pages/SellerApplication";
import ListUsers from "./pages/ListUsers";
import EditListing from "./pages/EditListing";
import type { Page } from "./components/Navbar";

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: Page) => {
    const pathMap: Record<Page, string> = {
      Home: "/",
      Products: "/products",
      Listing: "/listing",
      Login: "/login",
      Register: "/register",
      Help: "/help",
      Profile: "/profile",
      CartPage: "/cart",
      Checkout: "/checkout",
      PaymentProcessing: "/payment-processing",
      PaymentStatus: "/payment-status",
      ThankYou: "/thank-you",
      ApplySeller: "/apply-seller",
      SellerApplication: "/seller-application",
      ListUsers: "/list-users"
    };
    navigate(pathMap[page]);
  };

  const getCurrentPage = (): Page => {
    const path = location.pathname;
    const pageMap: Record<string, Page> = {
      "/": "Home",
      "/products": "Products",
      "/listing": "Listing",
      "/login": "Login",
      "/register": "Register",
      "/help": "Help",
      "/profile": "Profile",
      "/cart": "CartPage",
      "/checkout": "Checkout",
      "/payment-processing": "PaymentProcessing",
      "/thank-you": "ThankYou",
      "/payment-status": "PaymentStatus",
      "/apply-seller": "ApplySeller",
      "/list-users": "ListUsers"
    };
    return pageMap[path] || "Home";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Routes>
        <Route path="/" element={<Home onNavigate={handleNavigate} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/listing" element={<Listing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/help" element={<Help />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-processing" element={<PaymentProcessing />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/apply-seller" element={<ApplySeller />} />
        <Route path="/seller-application" element={<SellerApplication />} />
        <Route path="/list-users" element={<ListUsers />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
      </Routes>
    </div>
  );
};

export default AppContent;
