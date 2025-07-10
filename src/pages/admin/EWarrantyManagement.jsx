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
      // Corrected signature: (token, id, status)
      await updateWarrantyStatusAdmin(token, id, status);
      await refetchRequests(); // refresh list
    } catch (err) {
      setError("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    try {
      setError(null);
      // Corrected signature: (token, id)
      await deleteWarrantyAdmin(token, id);
      await refetchRequests(); // refresh list
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

  // Tailwind classes (unchanged)
  const commonInputClasses =
    "w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 transition-all duration-200 shadow-sm";
  const buttonSuccessClasses =
    "bg-lime-600 hover:bg-lime-700 text-white px-3 py-1 rounded-full shadow-md hover:scale-105 transition-all duration-200 text-xs font-semibold";
  const buttonWarningClasses =
    "bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-full shadow-md hover:scale-105 transition-all duration-200 text-xs font-semibold";
  const buttonDangerClasses =
    "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full shadow-md hover:scale-105 transition-all duration-200 text-xs font-semibold";

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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
        E-Warranty <span className="text-lime-700">Requests</span>
      </h1>

      {/* Search */}
      <div className="mb-6 max-w-sm mx-auto">
        <input
          type="text"
          placeholder="Search by serial, product, or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={commonInputClasses}
        />
      </div>

      {sortedAndFilteredRequests.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-lg">
          No warranty requests found
          {searchTerm && ` matching "${searchTerm}"`}.
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
                ].map((h) => (
                  <th
                    key={h.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {h.sortable ? (
                      <button
                        onClick={() => handleSort(h.key)}
                        className="flex items-center gap-1 focus:outline-none focus:text-lime-700 focus:ring-1 focus:ring-lime-600 rounded"
                      >
                        {h.name}
                        {sortColumn === h.key && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    ) : (
                      h.name
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{r.serial}</td>
                  <td className="px-4 py-3 text-sm">{r.product_name}</td>
                  <td className="px-4 py-3 text-sm">{r.user_name}</td>
                  <td className="px-4 py-3 text-sm">{r.user_email}</td>
                  <td className="px-4 py-3 text-sm">{r.user_phone || "N/A"}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(r.registered_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        r.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : r.status === "accepted"
                          ? "bg-lime-100 text-lime-800"
                          : "bg-red-100 text-red-800"
                      }`}
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
    </div>
  );
}
