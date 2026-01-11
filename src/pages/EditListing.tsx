import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.config";


const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { item?: any };

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    price: '',
    category: '',
    condition: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state?.item) {
      setFormData({
  name: state.item?.name ?? '',
  image: state.item?.image ?? '',
  description: state.item?.description ?? '',
  price: state.item?.price ? String(state.item.price) : '',
  category: state.item?.category ?? '',
  condition: state.item?.condition ? String(state.item.condition) : '',
});
    } else {
      alert("Item data not found in navigation state");
      navigate("/profile");
    }
  }, [state, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.image.trim()) newErrors.image = 'Image is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.condition.trim()) newErrors.condition = 'Condition is required';
    else if (
      isNaN(Number(formData.condition)) ||
      Number(formData.condition) < 1 ||
      Number(formData.condition) > 10
    ) {
      newErrors.condition = 'Condition must be a number between 1 and 10';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;
  if (!id) {
    alert("Item ID not found");
    return;
  }

  try {
    setUploading(true);

    const itemRef = doc(db, "Items", id); // ✅ correct collection + case

    await updateDoc(itemRef, {
      itemName: formData.name,
      itemImageURL: formData.image,
      itemDesc: formData.description,
      itemCategory: formData.category,
      price: Number(formData.price),
      quantity: Number(formData.condition),
      updatedAt: new Date(),
    });

    alert("Item updated successfully ✅");
    navigate("/profile", { state: { defaultTab: "listings" } });

  } catch (error) {
    console.error("Error updating item:", error);
    alert("Failed to update item ❌");
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
        <h2
          className="font-primary text-4xl font-bold text-[#333333] mb-8 block border-b-4 border-[#5a19ad] pb-2 text-center"
          style={{ textShadow: "0 0 15px rgba(90,25,173,0.5)" }}
        >
          ✍️ Edit Your Listing
        </h2>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5a19ad] focus:border-transparent ${
                  errors.name ? 'border-red-600' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (RM)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5a19ad] focus:border-transparent ${
                  errors.price ? 'border-red-600' : 'border-gray-300'
                }`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5a19ad] focus:border-transparent ${
                  errors.category ? 'border-red-600' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                <option value="Home Essentials">Home Essentials</option>
                <option value="Clothing">Clothing</option>
                <option value="Beauty and Health">Beauty and Health</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition (1-10)
              </label>
              <input
                type="number"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5a19ad] focus:border-transparent ${
                  errors.condition ? 'border-red-600' : 'border-gray-300'
                }`}
                placeholder="e.g., 8"
                min="1"
                max="10"
              />
              {errors.condition && (
                <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="Image URL"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5a19ad] focus:border-transparent ${
                errors.image ? 'border-red-600' : 'border-gray-300'
              }`}
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5a19ad] focus:border-transparent ${
                errors.description ? 'border-red-600' : 'border-gray-300'
              }`}
              placeholder="Describe your item..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-[#5a19ad] text-white px-6 py-3 rounded-lg hover:bg-[#A087C7] transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            disabled={uploading}
            onClick={() => navigate("/profile", { state: { defaultTab: "listings" } })}
            className="ml-4 bg-gray-300 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300 font-medium"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
