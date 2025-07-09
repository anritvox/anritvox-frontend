import React, { useState, useEffect } from "react";
import Card from "../../components/Card";
import {
  fetchWarrantyAdmin,
  fetchCategories,
  fetchProductsAdmin,
  fetchContactsAdmin,
} from "../../services/api";

export default function DashboardOverview({ token }) {
  // Overview counts
  const [reqCount, setReqCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [prodCount, setProdCount] = useState(0);
  // Contact submissions & pagination
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  // Loading & error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [warrantyData, categoryData, productData, contactData] =
          await Promise.all([
            fetchWarrantyAdmin(token),
            fetchCategories(token),
            fetchProductsAdmin(token),
            fetchContactsAdmin(token),
          ]);

        setReqCount(warrantyData.length);
        setCatCount(categoryData.length);
        setProdCount(productData.length);

        // sort newest first
        const sorted = contactData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setContacts(sorted);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [token]);

  // Pagination logic
  const totalPages = Math.ceil(contacts.length / PAGE_SIZE);
  const paginated = contacts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-700">
        <p className="text-2xl font-semibold animate-pulse">
          Loading dashboard data…
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">
        <p className="text-xl font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Overview Cards */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          Dashboard <span className="text-lime-700">Overview</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Card title="Warranty Requests" count={reqCount} />
          <Card title="Categories" count={catCount} />
          <Card title="Products" count={prodCount} />
        </div>
      </div>

      {/* Recent Contact Submissions with Pagination */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Recent Contact Submissions
        </h2>
        {contacts.length === 0 ? (
          <p className="text-center text-gray-600">No submissions yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto max-h-80">
              <table className="min-w-full text-left divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-sm font-medium">Name</th>
                    <th className="px-4 py-2 text-sm font-medium">Email</th>
                    <th className="px-4 py-2 text-sm font-medium">Phone</th>
                    <th className="px-4 py-2 text-sm font-medium">Message</th>
                    <th className="px-4 py-2 text-sm font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginated.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2 text-sm">{c.name}</td>
                      <td className="px-4 py-2 text-sm">{c.email}</td>
                      <td className="px-4 py-2 text-sm">{c.phone || "—"}</td>
                      <td className="px-4 py-2 text-sm">{c.message}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(c.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
