import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  sellerName: string;
  sellerEmail: string;
  condition: number;
  description: string;
  sold?: boolean;
}

const Products: React.FC = () => {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [currentImageIndices, setCurrentImageIndices] = useState<{
    [key: string]: number;
  }>({});

  const [confirmationMessage, setConfirmationMessage] =
    useState<string>("");

  const [productsData, setProductsData] = useState<Product[]>([]);

  const [products, setProducts] = useState<Product[]>(productsData);

  const categories = [
    "All",
    "Home Essentials",
    "Clothing",
    "Beauty and Health",
    "Electronics",
    "Books",
  ];

  useEffect(() => {
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "Items"));

    const items: Product[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();

      return {
        id: docSnap.id,

        // ✅ SAFE FALLBACKS
        name: data.itemName ?? "Untitled Item",
        price: Number(data.price) || 0,
        images: data.itemImageURL
          ? [data.itemImageURL]
          : ["/placeholder.png"],

        category: data.itemCategory ?? "Uncategorized",
        sellerName: data.sellerName ?? "Unknown Seller",
        sellerEmail: data.sellerEmail ?? "unknown@email.com",
        condition: Number(data.quantity) || 10,
        description: data.itemDesc ?? "",
        sold: data.sold ?? false,
      };
    }).filter((item) => !item.sold);

    setProductsData(items);
    setProducts(items);
  };

  fetchProducts();
}, []);


  useEffect(() => {
    const filtered = productsData.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    setProducts(filtered);
  }, [selectedCategory, searchTerm, productsData]);

  // ⭐⭐⭐ MODIFIED FUNCTION ⭐⭐⭐
  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    product: Product
  ) => {
    e.stopPropagation();

    const exists = cart.some((item) => item.id === product.id);

    if (exists) {
      setConfirmationMessage(`${product.name} is already in your cart!`);
      setTimeout(() => setConfirmationMessage(""), 2500);
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });

    setConfirmationMessage(`${product.name} added to cart!`);
    setTimeout(() => setConfirmationMessage(""), 2500);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      {confirmationMessage && (
        <div className="fixed top-24 right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          {confirmationMessage}
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center" style={{ textShadow: '0 0 15px rgba(90,25,173,0.5)' }}>
          🔍 Explore Items
        </h2>

        <p className="font-secondary text-lg text-gray-700 mb-6">
          Find your next pre-loved treasure.
        </p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products, sellers, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad] text-gray-700"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-[#5a19ad] text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const currentIndex = currentImageIndices[product.id] || 0;

            return (
              <div
                key={product.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition border border-gray-200 cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative mb-4">
                  <img
                    src={product.images[currentIndex]}
                    alt={product.name}
                    className="w-48 h-48 object-cover rounded-lg mx-auto"
                  />

                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndices((prev) => ({
                            ...prev,
                            [product.id]:
                              (currentIndex -
                                1 +
                                product.images.length) %
                              product.images.length,
                          }));
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#5a19ad] text-white px-3 py-2 rounded-lg text-sm font-bold shadow"
                      >
                        ‹
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndices((prev) => ({
                            ...prev,
                            [product.id]:
                              (currentIndex + 1) %
                              product.images.length,
                          }));
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#5a19ad] text-white px-3 py-2 rounded-lg text-sm font-bold shadow"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                <h3 className="font-semibold text-xl mb-3 text-center">
                  {product.name}
                </h3>

                <p className="mb-5 text-gray-600 text-lg font-medium text-center">
                  RM {product.price.toFixed(2)}
                </p>

                <button
                  onClick={(e) => handleAddToCart(e, product)}
                className="bg-[#5a19ad] text-white px-6 py-3 rounded-lg hover:bg-[#A087C7] transition font-semibold shadow-md w-full"
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Products;
