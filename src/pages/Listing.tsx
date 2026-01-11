import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config"; 
// Note: We removed the 'storage' import since we aren't using it anymore.

const Listing: React.FC = () => {
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: ''
  });

  // Store the image as a string (Base64)
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false); 

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Route Guard
  useEffect(() => {
    if (isAuthReady && !user) {
        // user is not logged in
    }
  }, [user, isAuthReady, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 📸 HANDLE IMAGE SELECTION & CONVERSION
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // 1. Check File Size (Limit to ~700KB to be safe for Firestore)
      if (file.size > 700 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image is too large! Please choose an image under 700KB." }));
        return;
      }

      // 2. Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        setImagePreview(base64String);
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    
    if (!imageBase64) newErrors.image = "Please upload an image of your item";

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.condition.trim()) newErrors.condition = 'Condition is required';
    else if (isNaN(Number(formData.condition)) || Number(formData.condition) < 1 || Number(formData.condition) > 10) {
      newErrors.condition = 'Condition must be a number between 1 and 10';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user || !imageBase64) return;

    setIsUploading(true);

    try {
      // 2️⃣ Save item to Firestore directly
      // The 'imageBase64' string contains the actual image data
      await addDoc(collection(db, "Items"), {
        itemName: formData.name,
        price: Number(formData.price),
        itemImageURL: imageBase64, // Saving the long string here
        itemCategory: formData.category,
        itemDesc: formData.description,
        condition: Number(formData.condition),
        sellerUID: user.uid,
        sellerName: user.displayName || "Unknown Seller",
        sellerEmail: user.email || "unknown@email.com",
        createdAt: serverTimestamp(),
      });

      alert("Item listed successfully! 🎉");

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        condition: "",
      });
      setImageBase64("");
      setImagePreview("");
      
      navigate("/products");
    } catch (error) {
      console.error("Error listing item:", error);
      alert("Failed to list item. Please try again.");
    } finally {
        setIsUploading(false);
    }
  };

  if (!isAuthReady) return <div className="min-h-screen pt-24 flex justify-center">Loading...</div>;

  if (!user || !user.email)
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100 text-center">
          <h2 className="font-primary text-4xl font-bold text-[#333333] mb-8 border-b-4 border-[#5a19ad] pb-2 text-center" style={{ textShadow: '0 0 15px rgba(90,25,173,0.5)' }}>⚠️ Login Required</h2>
          <p className="font-secondary text-lg text-red-600 mb-6">Please log in or register to list your item.</p>
          <button onClick={() => navigate("/login")} className="bg-[#5a19ad] text-white px-6 py-2 rounded-lg hover:bg-[#8349c2]">Go to Login</button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="font-primary text-4xl font-bold text-[#333333] mb-8 block border-b-4 border-[#5a19ad] pb-2 text-center" style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}>✍️ List Your Item</h2>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" placeholder="Enter item name" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (RM)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" placeholder="0.00" step="0.01" min="0" />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]">
                <option value="">Select a category</option>
                <option value="Home Essentials">Home Essentials</option>
                <option value="Clothing">Clothing</option>
                <option value="Beauty and Health">Beauty and Health</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition (1-10)</label>
              <input type="number" name="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" placeholder="e.g., 8" min="1" max="10" />
              {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
            </div>
          </div>

          {/* 📸 IMAGE UPLOAD SECTION (BASE64) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (Max 700KB)</label>
            <div className="flex items-center space-x-4">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5a19ad] file:text-white hover:file:bg-[#A087C7]"
                />
            </div>

            {imagePreview && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-lg border-2 border-[#5a19ad]" />
              </div>
            )}
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5a19ad]" placeholder="Describe your item..." />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <button type="submit" disabled={isUploading} className={`w-full text-white px-6 py-3 rounded-lg transition duration-300 font-medium ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5a19ad] hover:bg-[#A087C7]"}`}>
            {isUploading ? "Processing..." : "List Item"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">Logged in as: {user.email}</p>
      </div>
    </div>
  );
};

export default Listing;