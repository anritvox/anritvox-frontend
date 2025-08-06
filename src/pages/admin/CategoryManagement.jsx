// import React, { useState, useEffect } from "react";
// import {
//   fetchCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   fetchSubcategories,
//   createSubcategory,
//   updateSubcategory,
//   deleteSubcategory,
// } from "../../services/api";

// export default function CategoryManagement({ token }) {
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [name, setName] = useState("");
//   const [parentId, setParentId] = useState("");
//   const [editCatId, setEditCatId] = useState(null);
//   const [editSubId, setEditSubId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [formLoading, setFormLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const loadData = async () => {
//     setLoading(true);
//     setError(null); // Clear previous errors on load
//     try {
//       const [cats, subs] = await Promise.all([
//         fetchCategories(token),
//         fetchSubcategories(token),
//       ]);
//       setCategories(cats);
//       setSubcategories(subs);
//     } catch (err) {
//       setError("Failed to load data: " + err.message);
//       console.error("Error loading category data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [token]);

//   const resetForm = () => {
//     setName("");
//     setParentId("");
//     setEditCatId(null);
//     setEditSubId(null);
//     setError(null);
//   };

//   const handleCatSave = async () => {
//     setFormLoading(true);
//     setError(null);
//     try {
//       if (!name.trim()) throw new Error("Category name is required.");
//       if (editCatId) {
//         await updateCategory(editCatId, { name }, token);
//       } else {
//         await createCategory({ name }, token);
//       }
//       resetForm();
//       loadData(); // Re-fetch data to update lists
//     } catch (e) {
//       setError("Failed to save category: " + e.message);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleSubSave = async () => {
//     setFormLoading(true);
//     setError(null);
//     try {
//       if (!name.trim() || !parentId)
//         throw new Error("Subcategory name and parent category are required.");
//       const data = { name, category_id: parentId };
//       if (editSubId) {
//         await updateSubcategory(editSubId, data, token);
//       } else {
//         await createSubcategory(data, token);
//       }
//       resetForm();
//       loadData(); // Re-fetch data to update lists
//     } catch (e) {
//       setError("Failed to save subcategory: " + e.message);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleRemoveCat = async (id) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this category? This will also delete all associated subcategories and products."
//       )
//     ) {
//       setFormLoading(true);
//       setError(null);
//       try {
//         await deleteCategory(id, token);
//         loadData();
//       } catch (e) {
//         setError("Failed to delete category: " + e.message);
//       } finally {
//         setFormLoading(false);
//       }
//     }
//   };

//   const handleRemoveSub = async (id) => {
//     if (window.confirm("Are you sure you want to delete this subcategory?")) {
//       setFormLoading(true);
//       setError(null);
//       try {
//         await deleteSubcategory(id, token);
//         loadData();
//       } catch (e) {
//         setError("Failed to delete subcategory: " + e.message);
//       } finally {
//         setFormLoading(false);
//       }
//     }
//   };

//   // Common Tailwind CSS classes for consistent styling
//   const commonInputClasses =
//     "flex-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 shadow-sm";
//   const primaryButtonClasses =
//     "bg-lime-600 hover:bg-lime-700 text-white px-5 py-2 rounded-lg shadow-md font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
//   const secondaryButtonClasses =
//     "bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg shadow-md font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
//   const editButtonClasses =
//     "text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200";
//   const deleteButtonClasses =
//     "text-red-600 hover:text-red-800 font-medium transition-colors duration-200";

//   if (loading)
//     return (
//       <div className="text-center py-12 text-gray-700">
//         <p className="text-2xl font-semibold animate-pulse">
//           Loading categories and subcategories...
//         </p>
//       </div>
//     );

//   return (
//     <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 space-y-10 animate-fade-in">
//       <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
//         Category <span className="text-lime-700">Management</span>
//       </h1>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center justify-between shadow-sm">
//           <p className="text-lg font-medium">{error}</p>
//           <button
//             onClick={() => setError(null)}
//             className="text-red-500 hover:text-red-700 font-semibold text-xl"
//           >
//             &times;
//           </button>
//         </div>
//       )}

//       {/* Category Management Section */}
//       <div className="border border-gray-200 rounded-xl shadow-md p-6 bg-gray-50">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 border-gray-200">
//           {editCatId ? "Edit Category" : "Add New Category"}
//         </h2>
//         <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
//           <div className="flex-1 w-full">
//             <label
//               htmlFor="category-name"
//               className="block text-gray-700 text-sm font-medium mb-2"
//             >
//               Category Name
//             </label>
//             <input
//               id="category-name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="e.g., Electronics, Home Appliances"
//               className={commonInputClasses}
//               disabled={formLoading}
//             />
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={handleCatSave}
//               className={primaryButtonClasses}
//               disabled={formLoading || !name.trim()}
//             >
//               {editCatId ? "Update Category" : "Create Category"}
//             </button>
//             {editCatId && (
//               <button
//                 onClick={resetForm}
//                 className={secondaryButtonClasses}
//                 disabled={formLoading}
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </div>

//         <h3 className="text-xl font-semibold text-gray-800 mb-4">
//           Existing Categories
//         </h3>
//         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   ID
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {categories.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="3"
//                     className="px-4 py-3 text-center text-gray-500"
//                   >
//                     No categories found.
//                   </td>
//                 </tr>
//               ) : (
//                 categories.map((c) => (
//                   <tr
//                     key={c.id}
//                     className="hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     <td className="px-4 py-3 text-sm text-gray-800">{c.id}</td>
//                     <td className="px-4 py-3 text-sm text-gray-800">
//                       {c.name}
//                     </td>
//                     <td className="px-4 py-3 text-sm space-x-3">
//                       <button
//                         onClick={() => {
//                           setEditCatId(c.id);
//                           setName(c.name);
//                           setEditSubId(null); // Ensure subcategory form is reset
//                           setParentId(""); // Ensure subcategory form is reset
//                         }}
//                         className={editButtonClasses}
//                         disabled={formLoading}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleRemoveCat(c.id)}
//                         className={deleteButtonClasses}
//                         disabled={formLoading}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Subcategory Management Section */}
//       <div className="border border-gray-200 rounded-xl shadow-md p-6 bg-gray-50">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 border-gray-200">
//           {editSubId ? "Edit Subcategory" : "Add New Subcategory"}
//         </h2>
//         <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
//           <div className="flex-1 w-full">
//             <label
//               htmlFor="parent-category"
//               className="block text-gray-700 text-sm font-medium mb-2"
//             >
//               Parent Category
//             </label>
//             <select
//               id="parent-category"
//               value={parentId}
//               onChange={(e) => setParentId(e.target.value)}
//               className={commonInputClasses}
//               disabled={formLoading || categories.length === 0}
//             >
//               <option value="">Select Category</option>
//               {categories.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex-1 w-full">
//             <label
//               htmlFor="subcategory-name"
//               className="block text-gray-700 text-sm font-medium mb-2"
//             >
//               Subcategory Name
//             </label>
//             <input
//               id="subcategory-name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="e.g., Laptops, Smartphones"
//               className={commonInputClasses}
//               disabled={formLoading}
//             />
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={handleSubSave}
//               className={primaryButtonClasses}
//               disabled={formLoading || !name.trim() || !parentId}
//             >
//               {editSubId ? "Update Subcategory" : "Create Subcategory"}
//             </button>
//             {editSubId && (
//               <button
//                 onClick={resetForm}
//                 className={secondaryButtonClasses}
//                 disabled={formLoading}
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </div>

//         <h3 className="text-xl font-semibold text-gray-800 mb-4">
//           Existing Subcategories
//         </h3>
//         <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   ID
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Category
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {subcategories.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="4"
//                     className="px-4 py-3 text-center text-gray-500"
//                   >
//                     No subcategories found.
//                   </td>
//                 </tr>
//               ) : (
//                 subcategories.map((sc) => (
//                   <tr
//                     key={sc.id}
//                     className="hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     <td className="px-4 py-3 text-sm text-gray-800">{sc.id}</td>
//                     <td className="px-4 py-3 text-sm text-gray-800">
//                       {sc.name}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-800">
//                       {categories.find((c) => c.id === sc.category_id)?.name ||
//                         "N/A"}
//                     </td>
//                     <td className="px-4 py-3 text-sm space-x-3">
//                       <button
//                         onClick={() => {
//                           setEditSubId(sc.id);
//                           setName(sc.name);
//                           setParentId(sc.category_id);
//                           setEditCatId(null); // Ensure category form is reset
//                         }}
//                         className={editButtonClasses}
//                         disabled={formLoading}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleRemoveSub(sc.id)}
//                         className={deleteButtonClasses}
//                         disabled={formLoading}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Tailwind CSS custom animations and font import */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

//         .font-inter {
//           font-family: 'Inter', sans-serif;
//         }

//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.5s ease-out forwards;
//         }

//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
//         .animate-pulse {
//           animation: pulse 1.5s infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../services/api";
import {
  Plus,
  Edit3,
  Trash2,
  Folder,
  FolderPlus,
  Save,
  X,
  AlertCircle,
  Loader2,
  Search,
  Grid3X3,
  List,
} from "lucide-react";

export default function CategoryManagement({ token }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editCatId, setEditCatId] = useState(null);
  const [editSubId, setEditSubId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, subs] = await Promise.all([
        fetchCategories(token),
        fetchSubcategories(token),
      ]);
      setCategories(cats);
      setSubcategories(subs);
    } catch (err) {
      setError("Failed to load data: " + err.message);
      console.error("Error loading category data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const resetForm = () => {
    setName("");
    setParentId("");
    setEditCatId(null);
    setEditSubId(null);
    setError(null);
  };

  const handleCatSave = async () => {
    setFormLoading(true);
    setError(null);
    try {
      if (!name.trim()) throw new Error("Category name is required.");
      if (editCatId) {
        await updateCategory(editCatId, { name }, token);
      } else {
        await createCategory({ name }, token);
      }
      resetForm();
      loadData();
    } catch (e) {
      setError("Failed to save category: " + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubSave = async () => {
    setFormLoading(true);
    setError(null);
    try {
      if (!name.trim() || !parentId)
        throw new Error("Subcategory name and parent category are required.");
      const data = { name, category_id: parentId };
      if (editSubId) {
        await updateSubcategory(editSubId, data, token);
      } else {
        await createSubcategory(data, token);
      }
      resetForm();
      loadData();
    } catch (e) {
      setError("Failed to save subcategory: " + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveCat = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This will also delete all associated subcategories and products."
      )
    ) {
      setFormLoading(true);
      setError(null);
      try {
        await deleteCategory(id, token);
        loadData();
      } catch (e) {
        setError("Failed to delete category: " + e.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleRemoveSub = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      setFormLoading(true);
      setError(null);
      try {
        await deleteSubcategory(id, token);
        loadData();
      } catch (e) {
        setError("Failed to delete subcategory: " + e.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-lime-600 animate-spin" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-lime-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-6 animate-pulse">
            Loading Categories...
          </p>
          <p className="text-gray-500 mt-2">Fetching category data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-3xl p-8 border border-lime-200/50 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-lime-600 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Folder className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-lime-700 to-green-700 bg-clip-text text-transparent mb-4">
            Category Management
          </h1>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg animate-shake">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 text-lg">
                  Error Occurred
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-2 hover:bg-red-100 rounded-xl transition-colors duration-200"
            >
              <X className="h-6 w-6 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Category Management Section */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-lime-600 to-green-600 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <FolderPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editCatId ? "Edit Category" : "Create New Category"}
              </h2>
              <p className="text-lime-100">
                Manage your main product categories
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Category Form */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category Name
                </label>
                <div className="relative group">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Electronics, Home Appliances, Fashion"
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md group"
                    disabled={formLoading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Folder className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lime-600/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10"></div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCatSave}
                  disabled={formLoading || !name.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white px-6 py-4 rounded-xl shadow-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-700 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  {formLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                  ) : (
                    <Save className="h-5 w-5 relative z-10" />
                  )}
                  <span className="relative z-10">
                    {editCatId ? "Update" : "Create"}
                  </span>
                </button>

                {editCatId && (
                  <button
                    onClick={resetForm}
                    disabled={formLoading}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl shadow-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <X className="h-5 w-5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-lime-600" />
                Categories ({categories.length})
              </h3>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-lime-50 to-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Category Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <Folder className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-xl font-semibold text-gray-600 mb-2">
                              No categories found
                            </p>
                            <p className="text-gray-400">
                              Create your first category to get started
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categories.map((c, index) => (
                        <tr
                          key={c.id}
                          className="hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-300 group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-lime-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {c.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-lime-100 rounded-lg">
                                <Folder className="h-5 w-5 text-lime-600" />
                              </div>
                              <span className="text-lg font-medium text-gray-900">
                                {c.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditCatId(c.id);
                                  setName(c.name);
                                  setEditSubId(null);
                                  setParentId("");
                                }}
                                disabled={formLoading}
                                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveCat(c.id)}
                                disabled={formLoading}
                                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Management Section */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <List className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editSubId ? "Edit Subcategory" : "Create New Subcategory"}
              </h2>
              <p className="text-green-100">
                Add subcategories to organize products better
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Subcategory Form */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Parent Category
                </label>
                <div className="relative group">
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    disabled={formLoading || categories.length === 0}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Folder className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors duration-200" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Subcategory Name
                </label>
                <div className="relative group">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Laptops, Smartphones, Tablets"
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                    disabled={formLoading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <List className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors duration-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubSave}
                disabled={formLoading || !name.trim() || !parentId}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl shadow-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                {formLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                ) : (
                  <Save className="h-5 w-5 relative z-10" />
                )}
                <span className="relative z-10">
                  {editSubId ? "Update" : "Create"} Subcategory
                </span>
              </button>

              {editSubId && (
                <button
                  onClick={resetForm}
                  disabled={formLoading}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl shadow-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <X className="h-5 w-5" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Subcategories List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <List className="h-5 w-5 text-green-600" />
                Subcategories ({subcategories.length})
              </h3>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Subcategory Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Parent Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {subcategories.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <List className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-xl font-semibold text-gray-600 mb-2">
                              No subcategories found
                            </p>
                            <p className="text-gray-400">
                              Create subcategories to organize your products
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      subcategories.map((sc, index) => (
                        <tr
                          key={sc.id}
                          className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {sc.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <List className="h-5 w-5 text-green-600" />
                              </div>
                              <span className="text-lg font-medium text-gray-900">
                                {sc.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-lime-100 rounded">
                                <Folder className="h-4 w-4 text-lime-600" />
                              </div>
                              <span className="text-gray-800 font-medium">
                                {categories.find((c) => c.id === sc.category_id)
                                  ?.name || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditSubId(sc.id);
                                  setName(sc.name);
                                  setParentId(sc.category_id);
                                  setEditCatId(null);
                                }}
                                disabled={formLoading}
                                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveSub(sc.id)}
                                disabled={formLoading}
                                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #84cc16;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #65a30d;
        }
      `}</style>
    </div>
  );
}
