import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function PropertyTabs() {
  const [activeTab, setActiveTab] = useState("all");
  const [commercialType, setCommercialType] = useState("buy");
  const [showCommercialDropdown, setShowCommercialDropdown] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "commercial") {
      setShowCommercialDropdown(true);
    } else {
      setShowCommercialDropdown(false);
    }
  };

  const handleCommercialTypeChange = (type) => {
    setCommercialType(type);
    setShowCommercialDropdown(false);
  };

  const tabs = [
    { key: "all", label: "All Properties", icon: "🏘️" },
    { key: "buy", label: "Buy", icon: "🏠" },
    { key: "rent", label: "Rent", icon: "🔑" },
    { key: "plot", label: "Plot", icon: "🏞️" },
    { key: "commercial", label: "Commercial", icon: "🏢" },
  ];

  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Tab Container */}
        <div className="relative">
          {/* Background with gradient and glassmorphism effect */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-1 shadow-2xl backdrop-blur-sm">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
              {/* Mobile horizontal scroll container */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max md:min-w-0 md:justify-center">
                  {tabs.map((tab) => (
                    <div key={tab.key} className="relative">
                      <button
                        onClick={() => handleTabChange(tab.key)}
                        className={`group relative flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 rounded-xl text-sm md:text-base font-semibold transition-all duration-300 ease-out transform hover:scale-105 min-w-max ${
                          activeTab === tab.key
                            ? "bg-white text-blue-600 shadow-xl shadow-blue-500/25 border border-blue-100"
                            : "text-white hover:bg-white/20 hover:backdrop-blur-md hover:shadow-lg"
                        }`}
                      >
                        {/* Icon */}
                        <span className="text-lg md:text-xl">{tab.icon}</span>
                        {/* Label */}
                        <span className="whitespace-nowrap">{tab.label}</span>
                        {/* Commercial dropdown arrow */}
                        {tab.key === "commercial" && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              showCommercialDropdown &&
                              activeTab === "commercial"
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        )}
                        {/* Active tab indicator */}
                        {activeTab === tab.key && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Dropdown - Positioned below the main container */}
          {showCommercialDropdown && activeTab === "commercial" && (
            <div className="absolute top-full left-0 right-0 mt-3 z-50 flex justify-center">
              <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {/* Dropdown header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏢</span>
                    <h3 className="text-sm font-semibold text-gray-700">
                      Commercial Type
                    </h3>
                  </div>
                </div>
                {/* Dropdown options */}
                <div className="p-2">
                  {[
                    {
                      key: "buy",
                      label: "Buy Commercial",
                      icon: "💰",
                      desc: "Purchase commercial property",
                    },
                    {
                      key: "rent",
                      label: "Rent Commercial",
                      icon: "📋",
                      desc: "Lease commercial space",
                    },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleCommercialTypeChange(option.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] ${
                        commercialType === option.key
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">
                        {option.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {option.desc}
                        </div>
                      </div>
                      {commercialType === option.key && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-auto"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Selection Display */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-100">
            <span className="text-sm text-gray-600">Currently selected:</span>
            <span className="font-semibold text-blue-600">
              {activeTab === "commercial"
                ? `Commercial - ${commercialType.charAt(0).toUpperCase() + commercialType.slice(1)}`
                : tabs.find((tab) => tab.key === activeTab)?.label}
            </span>
            <span className="text-lg">
              {activeTab === "commercial"
                ? commercialType === "buy"
                  ? "💰"
                  : "📋"
                : tabs.find((tab) => tab.key === activeTab)?.icon}
            </span>
          </div>
        </div>

        {/* Mobile optimization note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 md:hidden">
            ← Swipe horizontally to see all tabs →
          </p>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showCommercialDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCommercialDropdown(false)}
        ></div>
      )}
    </div>
  );
}
