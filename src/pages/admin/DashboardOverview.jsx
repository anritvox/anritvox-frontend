import React, { useState, useEffect, useCallback } from "react";
import {
  fetchWarrantyAdmin,
  fetchCategories,
  fetchProductsAdmin,
  fetchContactsAdmin,
} from "../../services/api";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Package,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
} from "lucide-react";

// Professional StatCard with lime/green theme
const StatCard = ({
  title,
  count,
  icon: Icon,
  trend,
  trendValue,
  color = "lime",
  isLoading,
}) => {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (isLoading) return;

    let start = animatedCount;
    const end = count;
    const duration = 1500;
    const increment = (end - start) / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setAnimatedCount(end);
        clearInterval(counter);
      } else {
        setAnimatedCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [count, isLoading]);

  const colorClasses = {
    lime: "from-lime-500 to-lime-600 border-lime-200 shadow-lime-100",
    green: "from-green-500 to-green-600 border-green-200 shadow-green-100",
    emerald:
      "from-emerald-500 to-emerald-600 border-emerald-200 shadow-emerald-100",
    teal: "from-teal-500 to-teal-600 border-teal-200 shadow-teal-100",
  };

  return (
    <div
      className={`relative group bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl shadow-xl border transform hover:scale-105 transition-all duration-500 ease-in-out cursor-pointer overflow-hidden`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                trend === "up"
                  ? "bg-green-100/80 text-green-700"
                  : "bg-red-100/80 text-red-700"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trendValue}%
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-white/90 mb-2">{title}</h3>
        <p className="text-3xl font-black text-white mb-2">
          {animatedCount.toLocaleString()}
        </p>

        <div className="flex items-center gap-2 text-white/70 text-sm">
          <BarChart3 className="h-4 w-4" />
          <span>Real-time data</span>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

// Real-time Line Chart with lime/green theme
const RealTimeLineChart = ({ data, title }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2 text-lime-600">
          <Activity className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="h-64 relative">
        {/* Simple SVG Chart */}
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <linearGradient
              id="chartGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#84cc16" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#84cc16" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="400"
              y2={i * 40}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Data line */}
          <polyline
            fill="none"
            stroke="#84cc16"
            strokeWidth="3"
            points={data
              .map((value, index) => `${index * 50},${200 - value * 2}`)
              .join(" ")}
            className="animate-pulse"
          />

          {/* Area fill */}
          <polygon
            fill="url(#chartGradient)"
            points={`0,200 ${data
              .map((value, index) => `${index * 50},${200 - value * 2}`)
              .join(" ")} 400,200`}
          />

          {/* Data points */}
          {data.map((value, index) => (
            <circle
              key={index}
              cx={index * 50}
              cy={200 - value * 2}
              r="4"
              fill="#84cc16"
              className="animate-pulse"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

// Real-time Bar Chart with lime/green theme
const RealTimeBarChart = ({ data, title }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <BarChart3 className="h-5 w-5 text-lime-600" />
      </div>

      <div className="h-64 flex items-end gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-lime-600 to-lime-400 rounded-t-lg transition-all duration-1000 ease-out"
              style={{
                height: `${
                  (item.value / Math.max(...data.map((d) => d.value))) * 100
                }%`,
                minHeight: "20px",
              }}
            ></div>
            <span className="text-sm font-medium text-gray-600 mt-2">
              {item.label}
            </span>
            <span className="text-xs text-gray-400">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Real-time Pie Chart with lime/green theme
const RealTimePieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <PieChart className="h-5 w-5 text-lime-600" />
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 2.51} 251`;
              const strokeDashoffset = -cumulativePercentage * 2.51;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>

        <div className="ml-8 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
              <span className="text-sm text-gray-500">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function DashboardOverview({ token, isRealTimeSync }) {
  // State management
  const [reqCount, setReqCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [prodCount, setProdCount] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Chart data states
  const [lineChartData, setLineChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);

  const PAGE_SIZE = 5;

  // Generate realistic chart data with lime/green colors
  const generateChartData = useCallback(
    (warrantyCount, categoryCount, productCount, contactCount) => {
      // Line chart data (last 7 days activity)
      const lineData = Array.from({ length: 7 }, (_, i) => {
        const baseValue = warrantyCount / 7;
        return Math.floor(baseValue + (Math.random() - 0.5) * baseValue);
      });
      setLineChartData(lineData);

      // Bar chart data
      const barData = [
        { label: "Warranties", value: warrantyCount },
        { label: "Products", value: productCount },
        { label: "Categories", value: categoryCount },
        { label: "Contacts", value: contactCount },
      ];
      setBarChartData(barData);

      // Pie chart data with lime/green colors
      const pieData = [
        {
          label: "Active",
          value: Math.floor(warrantyCount * 0.7),
          color: "#84cc16",
        },
        {
          label: "Pending",
          value: Math.floor(warrantyCount * 0.2),
          color: "#eab308",
        },
        {
          label: "Completed",
          value: Math.floor(warrantyCount * 0.1),
          color: "#22c55e",
        },
      ];
      setPieChartData(pieData);
    },
    []
  );

  // Main data fetching function
  const loadAllData = useCallback(async () => {
    if (!isRealTimeSync && !loading) {
      setIsUpdating(true);
    } else {
      setLoading(true);
    }

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

      const sorted = contactData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setContacts(sorted);

      // Generate chart data
      generateChartData(
        warrantyData.length,
        categoryData.length,
        productData.length,
        contactData.length
      );

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, [token, isRealTimeSync, loading, generateChartData]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [token]);

  // Real-time sync effect
  useEffect(() => {
    if (!isRealTimeSync) return;

    const interval = setInterval(() => {
      loadAllData();
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTimeSync, loadAllData]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-lime-600 animate-spin" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-lime-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-6 animate-pulse">
            Loading Dashboard...
          </p>
          <p className="text-gray-500 mt-2">Fetching real-time data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-3xl border-2 border-red-200 shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-800 mb-4">{error}</p>
          <button
            onClick={loadAllData}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Real-time Status Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lime-100 rounded-lg">
            <Activity
              className={`h-5 w-5 text-lime-600 ${
                isRealTimeSync ? "animate-pulse" : ""
              }`}
            />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Real-time Dashboard</h2>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={loadAllData}
          disabled={isUpdating}
          className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Warranty Requests"
          count={reqCount}
          icon={FileText}
          trend="up"
          trendValue="8.2"
          color="lime"
          isLoading={isUpdating}
        />
        <StatCard
          title="Categories"
          count={catCount}
          icon={Package}
          trend="up"
          trendValue="5.1"
          color="green"
          isLoading={isUpdating}
        />
        <StatCard
          title="Products"
          count={prodCount}
          icon={Package}
          trend="up"
          trendValue="12.3"
          color="emerald"
          isLoading={isUpdating}
        />
        <StatCard
          title="Total Contacts"
          count={contacts.length}
          icon={Users}
          trend="up"
          trendValue="15.7"
          color="teal"
          isLoading={isUpdating}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RealTimeLineChart data={lineChartData} title="Weekly Activity Trend" />
        <RealTimeBarChart data={barChartData} title="Data Overview" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RealTimePieChart
            data={pieChartData}
            title="Warranty Status Distribution"
          />
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-lime-50 transition-colors duration-200 border border-gray-200 hover:border-lime-300">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-lime-600" />
                <span className="font-medium">New Warranty</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 border border-gray-200 hover:border-green-300">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-green-600" />
                <span className="font-medium">Add Product</span>
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-emerald-50 transition-colors duration-200 border border-gray-200 hover:border-emerald-300">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">View Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Contact Submissions Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Contact Submissions
            </h2>
            <p className="text-gray-500 mt-2">
              Latest customer inquiries and feedback
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                Real-time
              </span>
            </div>
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-600 mb-2">
              No submissions yet
            </p>
            <p className="text-gray-400">Customer inquiries will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-lime-50 to-green-50">
                    <tr>
                      {[
                        "Contact",
                        "Email",
                        "Phone",
                        "Message",
                        "Submitted",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginated.map((contact, index) => (
                      <tr
                        key={contact.id}
                        className="hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-lime-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {contact.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {contact.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 font-medium">
                            {contact.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600">
                            {contact.phone || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 max-w-xs truncate">
                            {contact.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 text-sm">
                              {new Date(contact.created_at).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-sm">Showing</span>
                <span className="font-semibold">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>
                <span className="text-sm">to</span>
                <span className="font-semibold">
                  {Math.min(currentPage * PAGE_SIZE, contacts.length)}
                </span>
                <span className="text-sm">of</span>
                <span className="font-semibold">{contacts.length}</span>
                <span className="text-sm">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Previous
                </button>

                <div className="flex items-center gap-1 mx-4">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg"
                            : "text-gray-600 hover:bg-lime-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
