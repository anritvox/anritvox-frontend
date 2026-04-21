import React from "react";
import { FiFileText, FiFolder, FiBox } from "react-icons/fi"; // Feather icons for example

export default function Card({ title, count }) {
  let IconComponent;
  let iconColorClass = "text-lime-600"; // Default icon color

  // Determine icon based on title
  switch (title) {
    case "Warranty Requests":
      IconComponent = FiFileText;
      break;
    case "Categories":
      IconComponent = FiFolder;
      break;
    case "Products":
      IconComponent = FiBox;
      break;
    default:
      IconComponent = null;
  }

  return (
    <div
      className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center
                    transform hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-in-out
                    flex flex-col items-center justify-center"
    >
      {IconComponent && (
        <div className={`mb-3 ${iconColorClass}`}>
          <IconComponent className="h-10 w-10 sm:h-12 sm:w-12" />{" "}
          {/* Larger icon size */}
        </div>
      )}
      <p className="text-sm sm:text-base text-gray-600 mb-1 font-medium">
        {title}
      </p>
      <p className="text-4xl sm:text-5xl font-extrabold text-lime-700 leading-none">
        {" "}
        {count}
      </p>
    </div>
  );
}
