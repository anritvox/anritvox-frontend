// import React, { useState, useEffect } from "react";
// import {
//   fetchWarrantyAdmin,
//   updateWarrantyStatusAdmin,
//   deleteWarrantyAdmin,
// } from "../../services/api";

// export default function EWarrantyManagement({ token }) {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortDirection, setSortDirection] = useState("asc");

//   const refetchRequests = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchWarrantyAdmin(token);
//       setRequests(data);
//     } catch (err) {
//       setError("Failed to fetch warranty requests: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) refetchRequests();
//   }, [token]);

//   const handleUpdateStatus = async (id, status) => {
//     try {
//       setError(null);
//       // Corrected signature: (token, id, status)
//       await updateWarrantyStatusAdmin(token, id, status);
//       await refetchRequests(); // refresh list
//     } catch (err) {
//       setError("Failed to update status: " + err.message);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this request?"))
//       return;
//     try {
//       setError(null);
//       // Corrected signature: (token, id)
//       await deleteWarrantyAdmin(token, id);
//       await refetchRequests(); // refresh list
//     } catch (err) {
//       setError("Failed to delete request: " + err.message);
//     }
//   };

//   // Sorting & filtering
//   const sortedAndFilteredRequests = [...requests]
//     .filter((r) =>
//       [r.serial, r.product_name, r.user_name]
//         .join(" ")
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (!sortColumn) return 0;
//       let valA = a[sortColumn],
//         valB = b[sortColumn];
//       if (typeof valA === "string") {
//         valA = valA.toLowerCase();
//         valB = valB.toLowerCase();
//       }
//       if (valA < valB) return sortDirection === "asc" ? -1 : 1;
//       if (valA > valB) return sortDirection === "asc" ? 1 : -1;
//       return 0;
//     });

//   const handleSort = (column) => {
//     if (sortColumn === column) {
//       setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
//     } else {
//       setSortColumn(column);
//       setSortDirection("asc");
//     }
//   };

//   // Tailwind classes (unchanged)
//   const commonInputClasses =
//     "w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 transition-all duration-200 shadow-sm";
//   const buttonSuccessClasses =
//     "bg-lime-600 hover:bg-lime-700 text-white px-3 py-1 rounded-full shadow-md hover:scale-105 transition-all duration-200 text-xs font-semibold";
//   const buttonWarningClasses =
//     "bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-full shadow-md hover:scale-105 transition-all duration-200 text-xs font-semibold";
//   const buttonDangerClasses =
//     "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full shadow-md hover:scale-105 transition-all duration-200 text-xs font-semibold";

//   if (loading) {
//     return (
//       <div className="text-center py-12 text-gray-700">
//         <p className="text-2xl font-semibold animate-pulse">
//           Loading E-Warranty requests...
//         </p>
//       </div>
//     );
//   }
//   if (error) {
//     return (
//       <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">
//         <p className="text-xl font-medium">{error}</p>
//         <button
//           onClick={refetchRequests}
//           className="mt-4 px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition-colors duration-200"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
//       <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
//         E-Warranty <span className="text-lime-700">Requests</span>
//       </h1>

//       {/* Search */}
//       <div className="mb-6 max-w-sm mx-auto">
//         <input
//           type="text"
//           placeholder="Search by serial, product, or name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className={commonInputClasses}
//         />
//       </div>

//       {sortedAndFilteredRequests.length === 0 ? (
//         <p className="text-center text-gray-500 py-8 text-lg">
//           No warranty requests found
//           {searchTerm && ` matching "${searchTerm}"`}.
//         </p>
//       ) : (
//         <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 {[
//                   { name: "Serial", key: "serial", sortable: false },
//                   { name: "Product", key: "product_name", sortable: true },
//                   { name: "Name", key: "user_name", sortable: false },
//                   { name: "Email", key: "user_email", sortable: false },
//                   { name: "Phone", key: "user_phone", sortable: false },
//                   { name: "Date", key: "registered_at", sortable: false },
//                   { name: "Status", key: "status", sortable: true },
//                   { name: "Actions", key: "actions", sortable: false },
//                 ].map((h) => (
//                   <th
//                     key={h.key}
//                     className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
//                   >
//                     {h.sortable ? (
//                       <button
//                         onClick={() => handleSort(h.key)}
//                         className="flex items-center gap-1 focus:outline-none focus:text-lime-700 focus:ring-1 focus:ring-lime-600 rounded"
//                       >
//                         {h.name}
//                         {sortColumn === h.key && (
//                           <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
//                         )}
//                       </button>
//                     ) : (
//                       h.name
//                     )}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedAndFilteredRequests.map((r) => (
//                 <tr key={r.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 text-sm">{r.serial}</td>
//                   <td className="px-4 py-3 text-sm">{r.product_name}</td>
//                   <td className="px-4 py-3 text-sm">{r.user_name}</td>
//                   <td className="px-4 py-3 text-sm">{r.user_email}</td>
//                   <td className="px-4 py-3 text-sm">{r.user_phone || "N/A"}</td>
//                   <td className="px-4 py-3 text-sm">
//                     {new Date(r.registered_at).toLocaleString()}
//                   </td>
//                   <td className="px-4 py-3 text-sm">
//                     <span
//                       className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         r.status === "pending"
//                           ? "bg-yellow-100 text-yellow-800"
//                           : r.status === "accepted"
//                           ? "bg-lime-100 text-lime-800"
//                           : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {r.status}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-sm space-x-2">
//                     {r.status === "pending" && (
//                       <>
//                         <button
//                           onClick={() => handleUpdateStatus(r.id, "accepted")}
//                           className={buttonSuccessClasses}
//                         >
//                           Accept
//                         </button>
//                         <button
//                           onClick={() => handleUpdateStatus(r.id, "rejected")}
//                           className={buttonWarningClasses}
//                         >
//                           Reject
//                         </button>
//                       </>
//                     )}
//                     <button
//                       onClick={() => handleDelete(r.id)}
//                       className={buttonDangerClasses}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import {
  fetchWarrantyAdmin,
  updateWarrantyStatusAdmin,
  deleteWarrantyAdmin,
} from "../../services/api";
import {
  Shield,
  Search,
  Check,
  X,
  Trash2,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function EWarrantyManagement({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const refetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWarrantyAdmin(token);
      setRequests(data);
    } catch (err) {
      setError("Failed to fetch warranty requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) refetchRequests();
  }, [token]);

  const handleUpdateStatus = async (id, status) => {
    try {
      setError(null);
      await updateWarrantyStatusAdmin(token, id, status);
      await refetchRequests();
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    try {
      setError(null);
      await deleteWarrantyAdmin(token, id);
      await refetchRequests();
    } catch (err) {
      setError("Failed to delete request: " + err.message);
    }
  };

  // Sorting & filtering
  const sortedAndFilteredRequests = [...requests]
    .filter((r) =>
      [r.serial, r.product_name, r.user_name]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortColumn) return 0;
      let valA = a[sortColumn],
        valB = b[sortColumn];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
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
            Loading E-Warranty Requests...
          </p>
          <p className="text-gray-500 mt-2">Fetching warranty data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-3xl border-2 border-red-200 shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-800 mb-4">{error}</p>
          <button
            onClick={refetchRequests}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-lime-600 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
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
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-lime-700 to-green-700 bg-clip-text text-transparent mb-4">
            E-Warranty Management
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
              <span>Total Requests: {requests.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Filtered: {sortedAndFilteredRequests.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
            </div>
            <input
              type="text"
              placeholder="Search by serial, product, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lime-600/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10"></div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>Filter active</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {sortedAndFilteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-2">
              No warranty requests found
            </p>
            <p className="text-gray-400">
              {searchTerm
                ? `No results matching "${searchTerm}"`
                : "Warranty requests will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-lime-50 to-green-50">
                  <tr>
                    {[
                      {
                        name: "Serial",
                        key: "serial",
                        sortable: false,
                        icon: FileText,
                      },
                      {
                        name: "Product",
                        key: "product_name",
                        sortable: true,
                        icon: FileText,
                      },
                      {
                        name: "Name",
                        key: "user_name",
                        sortable: false,
                        icon: User,
                      },
                      {
                        name: "Email",
                        key: "user_email",
                        sortable: false,
                        icon: Mail,
                      },
                      {
                        name: "Phone",
                        key: "user_phone",
                        sortable: false,
                        icon: Phone,
                      },
                      {
                        name: "Date",
                        key: "registered_at",
                        sortable: false,
                        icon: Calendar,
                      },
                      {
                        name: "Status",
                        key: "status",
                        sortable: true,
                        icon: Shield,
                      },
                      {
                        name: "Actions",
                        key: "actions",
                        sortable: false,
                        icon: null,
                      },
                    ].map((h) => (
                      <th
                        key={h.key}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          {h.icon && (
                            <h.icon className="h-4 w-4 text-gray-500" />
                          )}
                          {h.sortable ? (
                            <button
                              onClick={() => handleSort(h.key)}
                              className="flex items-center gap-1 hover:text-lime-700 transition-colors duration-200 focus:outline-none focus:text-lime-700"
                            >
                              {h.name}
                              {sortColumn === h.key &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </button>
                          ) : (
                            h.name
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedAndFilteredRequests.map((r, index) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-lime-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs mr-3">
                            #
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {r.serial}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {r.product_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {r.user_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-900">
                            {r.user_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {r.user_email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {r.user_phone || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(r.registered_at).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            r.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : r.status === "accepted"
                              ? "bg-lime-100 text-lime-800 border border-lime-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {r.status === "pending" && (
                            <Calendar className="h-3 w-3" />
                          )}
                          {r.status === "accepted" && (
                            <Check className="h-3 w-3" />
                          )}
                          {r.status === "rejected" && <X className="h-3 w-3" />}
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(r.id, "accepted")
                                }
                                className="flex items-center gap-1 bg-lime-100 hover:bg-lime-200 text-lime-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                              >
                                <Check className="h-4 w-4" />
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(r.id, "rejected")
                                }
                                className="flex items-center gap-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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
