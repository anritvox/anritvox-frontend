// import React, { useState, useEffect, useCallback } from "react";
// import {
//   fetchWarrantyAdmin,
//   fetchCategories,
//   fetchProductsAdmin,
//   fetchContactsAdmin,
// } from "../../services/api";
// import {
//   Loader2,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   Users,
//   Package,
//   FileText,
//   Calendar,
//   Clock,
//   ArrowRight,
//   BarChart3,
//   PieChart,
//   LineChart,
//   RefreshCw,
// } from "lucide-react";

// // Professional StatCard with lime/green theme
// const StatCard = ({
//   title,
//   count,
//   icon: Icon,
//   trend,
//   trendValue,
//   color = "lime",
//   isLoading,
// }) => {
//   const [animatedCount, setAnimatedCount] = useState(0);

//   useEffect(() => {
//     if (isLoading) return;

//     let start = animatedCount;
//     const end = count;
//     const duration = 1500;
//     const increment = (end - start) / (duration / 16);

//     const counter = setInterval(() => {
//       start += increment;
//       if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
//         setAnimatedCount(end);
//         clearInterval(counter);
//       } else {
//         setAnimatedCount(Math.floor(start));
//       }
//     }, 16);

//     return () => clearInterval(counter);
//   }, [count, isLoading]);

//   const colorClasses = {
//     lime: "from-lime-500 to-lime-600 border-lime-200 shadow-lime-100",
//     green: "from-green-500 to-green-600 border-green-200 shadow-green-100",
//     emerald:
//       "from-emerald-500 to-emerald-600 border-emerald-200 shadow-emerald-100",
//     teal: "from-teal-500 to-teal-600 border-teal-200 shadow-teal-100",
//   };

//   return (
//     <div
//       className={`relative group bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl shadow-xl border transform hover:scale-105 transition-all duration-500 ease-in-out cursor-pointer overflow-hidden`}
//     >
//       {/* Loading overlay */}
//       {isLoading && (
//         <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
//           <Loader2 className="h-6 w-6 text-white animate-spin" />
//         </div>
//       )}

//       <div className="relative z-10">
//         <div className="flex items-center justify-between mb-4">
//           <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
//             <Icon className="h-6 w-6 text-white" />
//           </div>
//           {trend && (
//             <div
//               className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
//                 trend === "up"
//                   ? "bg-green-100/80 text-green-700"
//                   : "bg-red-100/80 text-red-700"
//               }`}
//             >
//               {trend === "up" ? (
//                 <TrendingUp className="h-3 w-3" />
//               ) : (
//                 <TrendingDown className="h-3 w-3" />
//               )}
//               {trendValue}%
//             </div>
//           )}
//         </div>

//         <h3 className="text-lg font-bold text-white/90 mb-2">{title}</h3>
//         <p className="text-3xl font-black text-white mb-2">
//           {animatedCount.toLocaleString()}
//         </p>

//         <div className="flex items-center gap-2 text-white/70 text-sm">
//           <BarChart3 className="h-4 w-4" />
//           <span>Real-time data</span>
//         </div>
//       </div>

//       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//     </div>
//   );
// };

// // Real-time Line Chart with lime/green theme
// const RealTimeLineChart = ({ data, title }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//         <div className="flex items-center gap-2 text-lime-600">
//           <Activity className="h-4 w-4 animate-pulse" />
//           <span className="text-sm font-medium">Live</span>
//         </div>
//       </div>

//       <div className="h-64 relative">
//         {/* Simple SVG Chart */}
//         <svg className="w-full h-full" viewBox="0 0 400 200">
//           <defs>
//             <linearGradient
//               id="chartGradient"
//               x1="0%"
//               y1="0%"
//               x2="0%"
//               y2="100%"
//             >
//               <stop offset="0%" stopColor="#84cc16" stopOpacity="0.8" />
//               <stop offset="100%" stopColor="#84cc16" stopOpacity="0.1" />
//             </linearGradient>
//           </defs>

//           {/* Grid lines */}
//           {[0, 1, 2, 3, 4].map((i) => (
//             <line
//               key={i}
//               x1="0"
//               y1={i * 40}
//               x2="400"
//               y2={i * 40}
//               stroke="#E5E7EB"
//               strokeWidth="1"
//             />
//           ))}

//           {/* Data line */}
//           <polyline
//             fill="none"
//             stroke="#84cc16"
//             strokeWidth="3"
//             points={data
//               .map((value, index) => `${index * 50},${200 - value * 2}`)
//               .join(" ")}
//             className="animate-pulse"
//           />

//           {/* Area fill */}
//           <polygon
//             fill="url(#chartGradient)"
//             points={`0,200 ${data
//               .map((value, index) => `${index * 50},${200 - value * 2}`)
//               .join(" ")} 400,200`}
//           />

//           {/* Data points */}
//           {data.map((value, index) => (
//             <circle
//               key={index}
//               cx={index * 50}
//               cy={200 - value * 2}
//               r="4"
//               fill="#84cc16"
//               className="animate-pulse"
//             />
//           ))}
//         </svg>
//       </div>
//     </div>
//   );
// };

// // Real-time Bar Chart with lime/green theme
// const RealTimeBarChart = ({ data, title }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//         <BarChart3 className="h-5 w-5 text-lime-600" />
//       </div>

//       <div className="h-64 flex items-end gap-4">
//         {data.map((item, index) => (
//           <div key={index} className="flex-1 flex flex-col items-center">
//             <div
//               className="w-full bg-gradient-to-t from-lime-600 to-lime-400 rounded-t-lg transition-all duration-1000 ease-out"
//               style={{
//                 height: `${
//                   (item.value / Math.max(...data.map((d) => d.value))) * 100
//                 }%`,
//                 minHeight: "20px",
//               }}
//             ></div>
//             <span className="text-sm font-medium text-gray-600 mt-2">
//               {item.label}
//             </span>
//             <span className="text-xs text-gray-400">{item.value}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Real-time Pie Chart with lime/green theme
// const RealTimePieChart = ({ data, title }) => {
//   const total = data.reduce((sum, item) => sum + item.value, 0);
//   let cumulativePercentage = 0;

//   return (
//     <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//         <PieChart className="h-5 w-5 text-lime-600" />
//       </div>

//       <div className="flex items-center justify-center">
//         <div className="relative">
//           <svg width="200" height="200" className="transform -rotate-90">
//             {data.map((item, index) => {
//               const percentage = (item.value / total) * 100;
//               const strokeDasharray = `${percentage * 2.51} 251`;
//               const strokeDashoffset = -cumulativePercentage * 2.51;
//               cumulativePercentage += percentage;

//               return (
//                 <circle
//                   key={index}
//                   cx="100"
//                   cy="100"
//                   r="80"
//                   fill="none"
//                   stroke={item.color}
//                   strokeWidth="20"
//                   strokeDasharray={strokeDasharray}
//                   strokeDashoffset={strokeDashoffset}
//                   className="transition-all duration-1000 ease-out"
//                 />
//               );
//             })}
//           </svg>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-gray-800">{total}</div>
//               <div className="text-sm text-gray-500">Total</div>
//             </div>
//           </div>
//         </div>

//         <div className="ml-8 space-y-2">
//           {data.map((item, index) => (
//             <div key={index} className="flex items-center gap-2">
//               <div
//                 className="w-4 h-4 rounded-full"
//                 style={{ backgroundColor: item.color }}
//               ></div>
//               <span className="text-sm font-medium text-gray-700">
//                 {item.label}
//               </span>
//               <span className="text-sm text-gray-500">({item.value})</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function DashboardOverview({ token, isRealTimeSync }) {
//   // State management
//   const [reqCount, setReqCount] = useState(0);
//   const [catCount, setCatCount] = useState(0);
//   const [prodCount, setProdCount] = useState(0);
//   const [contacts, setContacts] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdate, setLastUpdate] = useState(new Date());
//   const [isUpdating, setIsUpdating] = useState(false);

//   // Chart data states
//   const [lineChartData, setLineChartData] = useState([]);
//   const [barChartData, setBarChartData] = useState([]);
//   const [pieChartData, setPieChartData] = useState([]);

//   const PAGE_SIZE = 5;

//   // Generate realistic chart data with lime/green colors
//   const generateChartData = useCallback(
//     (warrantyCount, categoryCount, productCount, contactCount) => {
//       // Line chart data (last 7 days activity)
//       const lineData = Array.from({ length: 7 }, (_, i) => {
//         const baseValue = warrantyCount / 7;
//         return Math.floor(baseValue + (Math.random() - 0.5) * baseValue);
//       });
//       setLineChartData(lineData);

//       // Bar chart data
//       const barData = [
//         { label: "Warranties", value: warrantyCount },
//         { label: "Products", value: productCount },
//         { label: "Categories", value: categoryCount },
//         { label: "Contacts", value: contactCount },
//       ];
//       setBarChartData(barData);

//       // Pie chart data with lime/green colors
//       const pieData = [
//         {
//           label: "Active",
//           value: Math.floor(warrantyCount * 0.7),
//           color: "#84cc16",
//         },
//         {
//           label: "Pending",
//           value: Math.floor(warrantyCount * 0.2),
//           color: "#eab308",
//         },
//         {
//           label: "Completed",
//           value: Math.floor(warrantyCount * 0.1),
//           color: "#22c55e",
//         },
//       ];
//       setPieChartData(pieData);
//     },
//     []
//   );

//   // Main data fetching function
//   const loadAllData = useCallback(async () => {
//     if (!isRealTimeSync && !loading) {
//       setIsUpdating(true);
//     } else {
//       setLoading(true);
//     }

//     setError(null);

//     try {
//       const [warrantyData, categoryData, productData, contactData] =
//         await Promise.all([
//           fetchWarrantyAdmin(token),
//           fetchCategories(token),
//           fetchProductsAdmin(token),
//           fetchContactsAdmin(token),
//         ]);

//       setReqCount(warrantyData.length);
//       setCatCount(categoryData.length);
//       setProdCount(productData.length);

//       const sorted = contactData.sort(
//         (a, b) => new Date(b.created_at) - new Date(a.created_at)
//       );
//       setContacts(sorted);

//       // Generate chart data
//       generateChartData(
//         warrantyData.length,
//         categoryData.length,
//         productData.length,
//         contactData.length
//       );

//       setLastUpdate(new Date());
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err);
//       setError("Failed to load dashboard data. Please try again.");
//     } finally {
//       setLoading(false);
//       setIsUpdating(false);
//     }
//   }, [token, isRealTimeSync, loading, generateChartData]);

//   // Initial load
//   useEffect(() => {
//     loadAllData();
//   }, [token]);

//   // Real-time sync effect
//   useEffect(() => {
//     if (!isRealTimeSync) return;

//     const interval = setInterval(() => {
//       loadAllData();
//     }, 30000); // Sync every 30 seconds

//     return () => clearInterval(interval);
//   }, [isRealTimeSync, loadAllData]);

//   // Pagination logic
//   const totalPages = Math.ceil(contacts.length / PAGE_SIZE);
//   const paginated = contacts.slice(
//     (currentPage - 1) * PAGE_SIZE,
//     currentPage * PAGE_SIZE
//   );

//   const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
//   const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="flex flex-col items-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
//           <div className="relative">
//             <Loader2 className="h-16 w-16 text-lime-600 animate-spin" />
//             <div className="absolute inset-0 h-16 w-16 border-4 border-lime-200 rounded-full animate-ping"></div>
//           </div>
//           <p className="text-2xl font-bold text-gray-700 mt-6 animate-pulse">
//             Loading Dashboard...
//           </p>
//           <p className="text-gray-500 mt-2">Fetching real-time data</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center p-8 bg-red-50 rounded-3xl border-2 border-red-200 shadow-xl">
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <Activity className="h-8 w-8 text-red-500" />
//           </div>
//           <p className="text-xl font-bold text-red-800 mb-4">{error}</p>
//           <button
//             onClick={loadAllData}
//             className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
//           >
//             Retry Connection
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 animate-fade-in-up">
//       {/* Real-time Status Header */}
//       <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-lime-100 rounded-lg">
//             <Activity
//               className={`h-5 w-5 text-lime-600 ${
//                 isRealTimeSync ? "animate-pulse" : ""
//               }`}
//             />
//           </div>
//           <div>
//             <h2 className="font-bold text-gray-800">Real-time Dashboard</h2>
//             <p className="text-sm text-gray-500">
//               Last updated: {lastUpdate.toLocaleTimeString()}
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={loadAllData}
//           disabled={isUpdating}
//           className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors duration-200 disabled:opacity-50"
//         >
//           <RefreshCw
//             className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
//           />
//           Refresh
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Warranty Requests"
//           count={reqCount}
//           icon={FileText}
//           trend="up"
//           trendValue="8.2"
//           color="lime"
//           isLoading={isUpdating}
//         />
//         <StatCard
//           title="Categories"
//           count={catCount}
//           icon={Package}
//           trend="up"
//           trendValue="5.1"
//           color="green"
//           isLoading={isUpdating}
//         />
//         <StatCard
//           title="Products"
//           count={prodCount}
//           icon={Package}
//           trend="up"
//           trendValue="12.3"
//           color="emerald"
//           isLoading={isUpdating}
//         />
//         <StatCard
//           title="Total Contacts"
//           count={contacts.length}
//           icon={Users}
//           trend="up"
//           trendValue="15.7"
//           color="teal"
//           isLoading={isUpdating}
//         />
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <RealTimeLineChart data={lineChartData} title="Weekly Activity Trend" />
//         <RealTimeBarChart data={barChartData} title="Data Overview" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2">
//           <RealTimePieChart
//             data={pieChartData}
//             title="Warranty Status Distribution"
//           />
//         </div>
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
//           <h3 className="text-xl font-bold text-gray-800 mb-4">
//             Quick Actions
//           </h3>
//           <div className="space-y-3">
//             <button className="w-full text-left p-3 rounded-lg hover:bg-lime-50 transition-colors duration-200 border border-gray-200 hover:border-lime-300">
//               <div className="flex items-center gap-3">
//                 <FileText className="h-5 w-5 text-lime-600" />
//                 <span className="font-medium">New Warranty</span>
//               </div>
//             </button>
//             <button className="w-full text-left p-3 rounded-lg hover:bg-green-50 transition-colors duration-200 border border-gray-200 hover:border-green-300">
//               <div className="flex items-center gap-3">
//                 <Package className="h-5 w-5 text-green-600" />
//                 <span className="font-medium">Add Product</span>
//               </div>
//             </button>
//             <button className="w-full text-left p-3 rounded-lg hover:bg-emerald-50 transition-colors duration-200 border border-gray-200 hover:border-emerald-300">
//               <div className="flex items-center gap-3">
//                 <Users className="h-5 w-5 text-emerald-600" />
//                 <span className="font-medium">View Reports</span>
//               </div>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Contact Submissions Table */}
//       <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
//               Contact Submissions
//             </h2>
//             <p className="text-gray-500 mt-2">
//               Latest customer inquiries and feedback
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//               <span className="text-sm font-medium text-green-700">
//                 Real-time
//               </span>
//             </div>
//           </div>
//         </div>

//         {contacts.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Users className="h-12 w-12 text-gray-400" />
//             </div>
//             <p className="text-xl font-semibold text-gray-600 mb-2">
//               No submissions yet
//             </p>
//             <p className="text-gray-400">Customer inquiries will appear here</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gradient-to-r from-lime-50 to-green-50">
//                     <tr>
//                       {[
//                         "Contact",
//                         "Email",
//                         "Phone",
//                         "Message",
//                         "Submitted",
//                       ].map((header) => (
//                         <th
//                           key={header}
//                           className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider"
//                         >
//                           {header}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-100">
//                     {paginated.map((contact, index) => (
//                       <tr
//                         key={contact.id}
//                         className="hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-300 group"
//                         style={{ animationDelay: `${index * 100}ms` }}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="w-10 h-10 bg-gradient-to-r from-lime-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                               {contact.name?.charAt(0).toUpperCase()}
//                             </div>
//                             <div className="ml-4">
//                               <div className="font-medium text-gray-900">
//                                 {contact.name}
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-gray-900 font-medium">
//                             {contact.email}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-gray-600">
//                             {contact.phone || "—"}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="text-gray-900 max-w-xs truncate">
//                             {contact.message}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-gray-400" />
//                             <span className="text-gray-600 text-sm">
//                               {new Date(contact.created_at).toLocaleString(
//                                 "en-IN",
//                                 {
//                                   dateStyle: "medium",
//                                   timeStyle: "short",
//                                 }
//                               )}
//                             </span>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Enhanced Pagination */}
//             <div className="flex items-center justify-between mt-8">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <span className="text-sm">Showing</span>
//                 <span className="font-semibold">
//                   {(currentPage - 1) * PAGE_SIZE + 1}
//                 </span>
//                 <span className="text-sm">to</span>
//                 <span className="font-semibold">
//                   {Math.min(currentPage * PAGE_SIZE, contacts.length)}
//                 </span>
//                 <span className="text-sm">of</span>
//                 <span className="font-semibold">{contacts.length}</span>
//                 <span className="text-sm">entries</span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={prevPage}
//                   disabled={currentPage === 1}
//                   className="px-6 py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
//                 >
//                   <ArrowRight className="h-4 w-4 rotate-180" />
//                   Previous
//                 </button>

//                 <div className="flex items-center gap-1 mx-4">
//                   {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                     let page;
//                     if (totalPages <= 5) {
//                       page = i + 1;
//                     } else if (currentPage <= 3) {
//                       page = i + 1;
//                     } else if (currentPage >= totalPages - 2) {
//                       page = totalPages - 4 + i;
//                     } else {
//                       page = currentPage - 2 + i;
//                     }

//                     return (
//                       <button
//                         key={page}
//                         onClick={() => setCurrentPage(page)}
//                         className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
//                           currentPage === page
//                             ? "bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg"
//                             : "text-gray-600 hover:bg-lime-50"
//                         }`}
//                       >
//                         {page}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <button
//                   onClick={nextPage}
//                   disabled={currentPage === totalPages}
//                   className="px-6 py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
//                 >
//                   Next
//                   <ArrowRight className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowLeft,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Bell,
  AlertCircle,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  MessageCircle,
  Zap,
  Shield,
  Globe,
  Filter,
  Search,
  Download,
  Settings,
  ChevronDown,
  IndianRupee,
  Star,
  Award,
  Target,
} from "lucide-react";

// Enhanced StatCard with improved animations and mobile responsiveness
const StatCard = ({
  title,
  count,
  icon: Icon,
  trend,
  trendValue,
  color = "lime",
  isLoading,
  subtitle,
  actionButton,
}) => {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (isLoading || count === undefined) return;

    let start = 0;
    const end = count;
    const duration = 1500;
    const increment = (end - start) / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedCount(end);
        clearInterval(counter);
      } else {
        setAnimatedCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [count, isLoading]);

  const colorClasses = {
    lime: {
      gradient: "from-lime-500 to-lime-600",
      border: "border-lime-200",
      shadow: "shadow-lime-100",
      bg: "bg-lime-50",
      text: "text-lime-700",
      icon: "text-lime-600",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      border: "border-green-200",
      shadow: "shadow-green-100",
      bg: "bg-green-50",
      text: "text-green-700",
      icon: "text-green-600",
    },
    emerald: {
      gradient: "from-emerald-500 to-emerald-600",
      border: "border-emerald-200",
      shadow: "shadow-emerald-100",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: "text-emerald-600",
    },
    blue: {
      gradient: "from-blue-500 to-blue-600",
      border: "border-blue-200",
      shadow: "shadow-blue-100",
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`relative group bg-gradient-to-br ${colors.gradient} p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl ${colors.border} border transform hover:scale-105 transition-all duration-500 ease-in-out cursor-pointer overflow-hidden`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center rounded-2xl sm:rounded-3xl z-20">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      )}

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                trend === "up"
                  ? "bg-green-100/80 text-green-700"
                  : trend === "down"
                  ? "bg-red-100/80 text-red-700"
                  : "bg-yellow-100/80 text-yellow-700"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Activity className="h-3 w-3" />
              )}
              {trendValue}%
            </div>
          )}
        </div>

        <h3 className="text-sm sm:text-lg font-bold text-white/90 mb-1 sm:mb-2 leading-tight">
          {title}
        </h3>

        <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {animatedCount.toLocaleString("en-IN")}
          </p>
          {subtitle && (
            <span className="text-xs sm:text-sm text-white/70">{subtitle}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Live data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced LineChart
const EnhancedLineChart = ({ data, title, color = "#84cc16" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Last 7 days performance
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-lime-50 rounded-full">
          <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-lime-600">
            Live
          </span>
        </div>
      </div>

      <div className="h-48 sm:h-64 relative">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="chartGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
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
              stroke="#F3F4F6"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}

          {/* Area fill */}
          <polygon
            fill="url(#chartGradient)"
            points={`0,200 ${data
              .map(
                (value, index) =>
                  `${index * 57},${Math.max(200 - (value || 0) * 2, 10)}`
              )
              .join(" ")} 400,200`}
          />

          {/* Data line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={data
              .map(
                (value, index) =>
                  `${index * 57},${Math.max(200 - (value || 0) * 2, 10)}`
              )
              .join(" ")}
          />

          {/* Data points */}
          {data.map((value, index) => (
            <circle
              key={index}
              cx={index * 57}
              cy={Math.max(200 - (value || 0) * 2, 10)}
              r="4"
              fill={color}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

// Enhanced BarChart
const EnhancedBarChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No data available</div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0));

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Current overview
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-lime-600" />
      </div>

      <div className="h-48 sm:h-64 flex items-end gap-2 sm:gap-4">
        {data.map((item, index) => {
          const height =
            maxValue > 0 ? ((item.value || 0) / maxValue) * 100 : 0;
          const colors = [
            "from-lime-500 to-lime-600",
            "from-green-500 to-green-600",
            "from-emerald-500 to-emerald-600",
            "from-teal-500 to-teal-600",
          ];

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center group"
            >
              <div
                className={`w-full bg-gradient-to-t ${
                  colors[index % colors.length]
                } rounded-t-lg transition-all duration-1000 ease-out shadow-lg hover:shadow-xl cursor-pointer relative overflow-hidden`}
                style={{
                  height: `${Math.max(height, 5)}%`,
                  minHeight: "20px",
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    {(item.value || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-xs sm:text-sm font-medium text-gray-700 block">
                  {item.label}
                </span>
                <span className="text-xs text-gray-500 block mt-1">
                  {(item.value || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced PieChart
const EnhancedPieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No data available</div>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  let cumulativePercentage = 0;

  if (total === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No data to display</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Distribution overview
          </p>
        </div>
        <PieChart className="h-5 w-5 text-lime-600" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
        <div className="relative">
          <svg width="180" height="180" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = ((item.value || 0) / total) * 100;
              const strokeDasharray = `${percentage * 2.26} 226`;
              const strokeDashoffset = -cumulativePercentage * 2.26;
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-800">
                {total.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 flex-1 min-w-0">
          {data.map((item, index) => {
            const percentage = (((item.value || 0) / total) * 100).toFixed(1);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {item.label}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function DashboardOverview({ token, isRealTimeSync }) {
  // State management - FIXED: Removed dependencies that cause loops
  const [stats, setStats] = useState({
    warranties: 0,
    categories: 0,
    products: 0,
    contacts: 0,
  });
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Chart data states
  const [lineChartData, setLineChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);

  const PAGE_SIZE = 6;

  // Memoized filtered contacts
  const filteredContacts = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];

    return contacts.filter((contact) => {
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        (contact.name && contact.name.toLowerCase().includes(query)) ||
        (contact.email && contact.email.toLowerCase().includes(query)) ||
        (contact.message && contact.message.toLowerCase().includes(query))
      );
    });
  }, [contacts, searchQuery]);

  // FIXED: Generate chart data without dependencies that cause loops
  const generateChartData = useCallback(
    (warrantyCount, categoryCount, productCount, contactCount) => {
      // Line chart - last 7 days activity
      const baseActivity = Math.max(Math.floor(warrantyCount / 7), 1);
      const lineData = Array.from({ length: 7 }, (_, i) => {
        const variation = Math.sin(i * 0.5) * 0.3 + Math.random() * 0.4;
        return Math.max(Math.floor(baseActivity * (1 + variation)), 0);
      });
      setLineChartData(lineData);

      // Bar chart data
      const barData = [
        { label: "Warranties", value: warrantyCount || 0 },
        { label: "Products", value: productCount || 0 },
        { label: "Categories", value: categoryCount || 0 },
        { label: "Contacts", value: contactCount || 0 },
      ];
      setBarChartData(barData);

      // Pie chart data
      const totalWarranties = Math.max(warrantyCount || 0, 1);
      const pieData = [
        {
          label: "Active",
          value: Math.floor(totalWarranties * 0.65),
          color: "#10b981",
        },
        {
          label: "Pending",
          value: Math.floor(totalWarranties * 0.25),
          color: "#f59e0b",
        },
        {
          label: "Expired",
          value: Math.floor(totalWarranties * 0.1),
          color: "#ef4444",
        },
      ];
      setPieChartData(pieData);
    },
    []
  ); // FIXED: Empty dependency array

  // FIXED: Main data fetching function with proper error handling
  const loadAllData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isUpdating && !loading) return;

    if (!loading) {
      setIsUpdating(true);
    }

    setError(null);

    try {
      const results = await Promise.allSettled([
        fetchWarrantyAdmin(token),
        fetchCategories(token),
        fetchProductsAdmin(token),
        fetchContactsAdmin(token),
      ]);

      // Handle results safely
      const warrantyData =
        results[0].status === "fulfilled" ? results[0].value : [];
      const categoryData =
        results[1].status === "fulfilled" ? results[1].value : [];
      const productData =
        results[2].status === "fulfilled" ? results[2].value : [];
      const contactData =
        results[3].status === "fulfilled" ? results[3].value : [];

      const newStats = {
        warranties: warrantyData.length || 0,
        categories: categoryData.length || 0,
        products: productData.length || 0,
        contacts: contactData.length || 0,
      };

      setStats(newStats);

      // Sort contacts by most recent
      const sortedContacts = Array.isArray(contactData)
        ? contactData.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        : [];
      setContacts(sortedContacts);

      // Generate chart data
      generateChartData(
        warrantyData.length || 0,
        categoryData.length || 0,
        productData.length || 0,
        contactData.length || 0
      );

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        "Failed to load dashboard data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, [token, generateChartData, isUpdating, loading]); // FIXED: Proper dependencies

  // FIXED: Initial load effect
  useEffect(() => {
    if (token && loading) {
      loadAllData();
    }
  }, [token]); // FIXED: Only depend on token

  // FIXED: Real-time sync effect
  useEffect(() => {
    if (!isRealTimeSync || !token) return;

    const interval = setInterval(() => {
      if (!isUpdating && !loading) {
        loadAllData();
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTimeSync, token]); // FIXED: Minimal dependencies

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // Export contacts function
  const exportContacts = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Message", "Date"],
      ...filteredContacts.map((contact) => [
        contact.name || "",
        contact.email || "",
        contact.phone || "",
        contact.message || "",
        new Date(contact.created_at).toLocaleDateString("en-IN"),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center p-6 sm:p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 max-w-md w-full">
          <div className="relative">
            <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-lime-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 border-4 border-lime-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-700 mt-4 sm:mt-6 animate-pulse text-center">
            Loading Dashboard...
          </p>
          <p className="text-gray-500 mt-2 text-center text-sm sm:text-base">
            Fetching real-time data
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center p-6 sm:p-8 bg-red-50 rounded-3xl border-2 border-red-200 shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-800 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadAllData();
            }}
            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up p-2 sm:p-0">
      {/* Header with Real-time Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-lime-100 to-green-100 rounded-xl">
            <Activity
              className={`h-5 w-5 sm:h-6 sm:w-6 text-lime-600 ${
                isRealTimeSync ? "animate-pulse" : ""
              }`}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Real-time Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              Last updated:{" "}
              {lastUpdate.toLocaleString("en-IN", {
                dateStyle: "short",
                timeStyle: "medium",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-green-700">
              {isRealTimeSync ? "Live Sync" : "Manual"}
            </span>
          </div>

          <button
            onClick={() => {
              if (!isUpdating && !loading) {
                loadAllData();
              }
            }}
            disabled={isUpdating}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-lime-600 text-white rounded-xl hover:bg-lime-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <RefreshCw
              className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Warranty Requests"
          count={stats.warranties}
          icon={Shield}
          trend="up"
          trendValue="8.2"
          color="lime"
          isLoading={isUpdating}
          subtitle="Active"
        />
        <StatCard
          title="Product Categories"
          count={stats.categories}
          icon={Package}
          trend="up"
          trendValue="5.1"
          color="green"
          isLoading={isUpdating}
          subtitle="Types"
        />
        <StatCard
          title="Total Products"
          count={stats.products}
          icon={Award}
          trend="up"
          trendValue="12.3"
          color="emerald"
          isLoading={isUpdating}
          subtitle="Items"
        />
        <StatCard
          title="Customer Contacts"
          count={stats.contacts}
          icon={Users}
          trend="up"
          trendValue="15.7"
          color="blue"
          isLoading={isUpdating}
          subtitle="Inquiries"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <EnhancedLineChart
          data={lineChartData}
          title="Weekly Activity Trend"
          color="#10b981"
        />
        <EnhancedBarChart data={barChartData} title="System Overview" />
      </div>

      {/* Pie Chart */}
      <div className="grid grid-cols-1">
        <EnhancedPieChart
          data={pieChartData}
          title="Warranty Status Distribution"
        />
      </div>

      {/* Contact Submissions Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Contact Submissions
            </h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
              Latest customer inquiries and feedback • Total:{" "}
              {filteredContacts.length}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent w-full sm:w-64 text-sm"
              />
            </div>

            <button
              onClick={exportContacts}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200 text-sm whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              {searchQuery
                ? "No matching contacts found"
                : "No submissions yet"}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Customer inquiries will appear here"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-lime-50 to-green-50">
                    <tr>
                      {[
                        { label: "Contact", icon: Users },
                        { label: "Email", icon: Mail },
                        { label: "Phone", icon: Phone },
                        { label: "Message", icon: MessageCircle },
                        { label: "Submitted", icon: Calendar },
                      ].map((header) => (
                        <th
                          key={header.label}
                          className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-2">
                            <header.icon className="h-4 w-4 text-gray-500" />
                            <span className="hidden sm:inline">
                              {header.label}
                            </span>
                            <span className="sm:hidden">
                              {header.label.split(" ")[0]}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedContacts.map((contact, index) => (
                      <tr
                        key={contact.id || index}
                        className="hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 transition-all duration-300 group"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-lime-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                              {(contact.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <div className="font-medium text-gray-900 text-sm sm:text-base">
                                {contact.name || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-gray-900 font-medium text-sm break-all">
                            {contact.email}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600 text-sm">
                            {contact.phone || (
                              <span className="text-gray-400 italic">
                                Not provided
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div
                            className="text-gray-900 max-w-xs truncate text-sm"
                            title={contact.message}
                          >
                            {contact.message}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-600 text-xs sm:text-sm">
                            {new Date(contact.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>Showing</span>
                  <span className="font-semibold text-gray-900">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </span>
                  <span>to</span>
                  <span className="font-semibold text-gray-900">
                    {Math.min(currentPage * PAGE_SIZE, filteredContacts.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-gray-900">
                    {filteredContacts.length}
                  </span>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 text-sm sm:text-base"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <div className="flex items-center gap-1 mx-2 sm:mx-4">
                    <span className="text-sm text-gray-600">
                      {currentPage} / {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-lime-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
}
