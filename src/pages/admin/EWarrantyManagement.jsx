import React, { useState, useEffect } from "react";
import {
  fetchWarrantyAdmin,
  updateWarrantyStatusAdmin,
  deleteWarrantyAdmin,
} from "../../services/api";

export default function EWarrantyManagement({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null); // State for current sort column
  const [sortDirection, setSortDirection] = useState("asc"); // State for sort direction: 'asc' or 'desc'

  const refetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWarrantyAdmin(token);
      setRequests(data);
    } catch (err) {
      setError("Failed to fetch warranty requests: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchRequests();
  }, [token]);

  const handleUpdateStatus = async (id, status) => {
    try {
      setError(null);
      await updateWarrantyStatusAdmin(id, status, token);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (err) {
      setError("Failed to update status: " + err.message);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    try {
      setError(null);
      await deleteWarrantyAdmin(id, token);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError("Failed to delete request: " + err.message);
      console.error(err);
    }
  };

  // --- Sorting Logic ---
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter and Sort Requests
  const sortedAndFilteredRequests = [...requests]
    .filter((r) => r.serial.toUpperCase().includes(searchTerm.toUpperCase()))
    .sort((a, b) => {
      if (!sortColumn) return 0; // No sort column selected

      let valA, valB;

      switch (sortColumn) {
        case "product_name":
          valA = a.product_name.toLowerCase();
          valB = b.product_name.toLowerCase();
          break;
        case "status":
          valA = a.status.toLowerCase();
          valB = b.status.toLowerCase();
          break;
        default:
          return 0; // Should not happen if sortColumn is one of the defined cases
      }

      if (valA < valB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

  // --- Common Tailwind CSS classes ---
  const commonInputClasses =
    "w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 shadow-sm";
  const buttonSuccessClasses =
    "bg-lime-600 hover:bg-lime-700 text-white px-3 py-1 rounded-full shadow-md transform hover:scale-105 transition-all duration-200 text-xs font-semibold";
  const buttonWarningClasses =
    "bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-full shadow-md transform hover:scale-105 transition-all duration-200 text-xs font-semibold";
  const buttonDangerClasses =
    "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full shadow-md transform hover:scale-105 transition-all duration-200 text-xs font-semibold";

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-700">
        <p className="text-2xl font-semibold animate-pulse">
          Loading E-Warranty requests...
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">
        <p className="text-xl font-medium">{error}</p>
        <button
          onClick={refetchRequests}
          className="mt-4 px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
        E-Warranty <span className="text-lime-700">Requests</span>
      </h1>

      {/* Search Bar for Serial Number */}
      <div className="mb-6 max-w-sm mx-auto">
        <label htmlFor="search-serial" className="sr-only">
          Search by serial number
        </label>
        <input
          id="search-serial"
          type="text"
          placeholder="Search by serial number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={commonInputClasses}
        />
      </div>

      {sortedAndFilteredRequests.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-lg">
          No warranty requests found{searchTerm && ` matching "${searchTerm}"`}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { name: "Serial", key: "serial", sortable: false },
                  { name: "Product", key: "product_name", sortable: true },
                  { name: "Name", key: "user_name", sortable: false },
                  { name: "Email", key: "user_email", sortable: false },
                  { name: "Phone", key: "user_phone", sortable: false },
                  { name: "Date", key: "registered_at", sortable: false },
                  { name: "Status", key: "status", sortable: true },
                  { name: "Actions", key: "actions", sortable: false },
                ].map((header) => (
                  <th
                    key={header.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {header.sortable ? (
                      <button
                        onClick={() => handleSort(header.key)}
                        className="flex items-center gap-1 focus:outline-none focus:text-lime-700 focus:ring-1 focus:ring-lime-600 rounded"
                      >
                        {header.name}
                        {sortColumn === header.key && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            )}
                          </span>
                        )}
                      </button>
                    ) : (
                      header.name
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredRequests.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {r.serial}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {r.product_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {r.user_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {r.user_email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {r.user_phone || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {new Date(r.registered_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          r.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          r.status === "accepted"
                            ? "bg-lime-100 text-lime-800"
                            : ""
                        }
                        ${
                          r.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                      `}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "accepted")}
                          className={buttonSuccessClasses}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "rejected")}
                          className={buttonWarningClasses}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className={buttonDangerClasses}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tailwind custom animations & font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:translateY(0);} }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes pulse { 0%,100% { opacity:1;} 50% { opacity:0.5;} }
        .animate-pulse { animation: pulse 1.5s infinite; }
      `}</style>
    </div>
  );
}
