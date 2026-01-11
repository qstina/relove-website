import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // 1. Get 'cart' from context to check for duplicates
  const { addToCart, cart } = useCart(); 

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 2. Add state for the confirmation message (Toast)
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");

  useEffect(() => {
  const fetchProduct = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, "Items", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        navigate("/products");
        return;
      }

      const data = docSnap.data();

      setProduct({
        id: docSnap.id, // ✅ Firestore ID (string)
        name: data.itemName,
        price: data.price,
        images: data.itemImageURL ? [data.itemImageURL] : [],
        category: data.itemCategory,
        description: data.itemDesc,
        condition: data.condition ?? 1, // ✅ IMPORTANT
        sellerName: data.sellerName ?? "Unknown Seller",
        sellerEmail: data.sellerEmail ?? "unknown@email.com",
      });
    } catch (error) {
      console.error("Error loading product:", error);
      navigate("/products");
    }
  };

  fetchProduct();
}, [id, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#A87A6F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // 3. ⭐⭐⭐ MODIFIED AddToCart FUNCTION ⭐⭐⭐
  const AddToCart = () => {
    // Check for duplicates
    const exists = cart.some((item) => item.id === product.id);

    if (exists) {
      setConfirmationMessage(`${product.name} is already in your cart!`);
      setTimeout(() => setConfirmationMessage(""), 2500);
      return;
    }

    // Pass structured object like listing page
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });

    // Show toast message instead of alert
    setConfirmationMessage(`${product.name} added to cart!`);
    setTimeout(() => setConfirmationMessage(""), 2500);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
    if (zoomLevel <= 1.5) {
      setPanX(0);
      setPanY(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      const maxPan = (zoomLevel - 1) * 100;
      setPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
      setPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      
      {/* 4. ⭐⭐⭐ Added Confirmation Message Toast UI ⭐⭐⭐ */}
      {confirmationMessage && (
        <div className="fixed top-24 right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          {confirmationMessage}
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">

        <button
          onClick={() => navigate("/products")}
          className="mb-6 text-[#5a19ad] hover:text-[#A087C7] font-semibold flex items-center"
        >
          <svg
            className="w-6 h-6 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Products
        </button>

        {/* Modal for zoomed image */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
            <div className="relative max-w-4xl max-h-full p-4 overflow-hidden flex flex-col items-center">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-gray-300 z-10"
              >
                ×
              </button>
              <div className="flex justify-center space-x-4 mb-4 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                  className="bg-[#5a19ad] text-white px-4 py-2 rounded-lg hover:bg-[#A087C7] transition"
                >
                  Zoom Out
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                  className="bg-[#5a19ad] text-white px-4 py-2 rounded-lg hover:bg-[#A087C7] transition"
                >
                  Zoom In
                </button>
              </div>
              <div
                className="flex items-center justify-center w-full h-full cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="object-contain select-none"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                  }}
                  onClick={(e) => e.stopPropagation()}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              {product.images.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-0 z-10 bg-[#B19CD9] text-white p-3 rounded-full text-lg font-bold hover:bg-[#A087C7] transition shadow-lg transform -translate-x-1/2"
                >
                  ‹
                </button>
              )}
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-96 object-contain rounded-xl shadow-lg cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              />
              {product.images.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-0 z-10 bg-[#5a19ad] text-white p-3 rounded-full text-lg font-bold hover:bg-[#A087C7] transition shadow-lg transform translate-x-1/2"
                >
                  ›
                </button>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      index === currentImageIndex
                        ? "border-[#5a19ad]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-primary text-4xl font-bold text-[#333333] mb-2">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-[#5a19ad] mb-4">
                RM {product.price.toFixed(2)}
              </p>
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Condition</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full ${
                          i < product.condition ? "bg-[#5a19ad]" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {product.condition}/10
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Seller Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Name:</span> {product.sellerName}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      href={`mailto:${product.sellerEmail}`}
                      className="text-[#5a19ad] hover:text-[#A087C7] underline"
                    >
                      {product.sellerEmail}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={AddToCart}
              className="w-full bg-[#5a19ad] text-white py-4 px-6 rounded-lg hover:bg-[#A087C7] transition font-semibold text-lg shadow-lg"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;