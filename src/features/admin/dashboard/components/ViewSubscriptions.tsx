"use client"
import { useState } from "react";
import SubTransactions from "./subscriptionTabs/SubTransactions";
import SubSubscriptions from "./subscriptionTabs/SubSubscriptions";
import SubPlans from "./subscriptionTabs/SubPlans";
 



const ViewSubscriptions = () => {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="max-w-2xl mx-auto mt-10">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300">
        {["transactions", "subscriptions", "plans"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "transactions" && <SubTransactions />}
        {activeTab === "subscriptions" && <SubSubscriptions />}
        {activeTab === "plans" && <SubPlans />}
      </div>
    </div>
  );
};

export default ViewSubscriptions;
