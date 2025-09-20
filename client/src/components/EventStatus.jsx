import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EventStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // We can pass status via state from navigate or via query params
  const { status, message, description, originalStatus } = location.state || {};
  
  console.log("=== EventStatus Component Debug ===");
  console.log("Received status:", status);
  console.log("Received message:", message);
  console.log("Received description:", description);
  console.log("Original status:", originalStatus);
  console.log("==================================");
  
  let title = "Event Status";
  let desc = "";
  let bgColor = "bg-gray-100";
  let iconColor = "text-gray-600";

  // Handle ONLY 3 statuses: pending, completed, notfound
  switch (status) {
    case "pending":
      title = "Event Not Active";
      desc = "This event is not active yet.";
      bgColor = "bg-yellow-50";
      iconColor = "text-yellow-600";
      break;
      
    case "completed":
      title = "Gift Selection Completed";
      desc = "This event has already been completed.";
      bgColor = "bg-green-50";
      iconColor = "text-green-600";
      break;
      
    case "notfound":
    default:
      title = "404 - Event Not Found";
      desc = "No active event found with this identifier.";
      bgColor = "bg-gray-50";
      iconColor = "text-gray-600";
      break;
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center ${bgColor}`}>
      <div className={`text-6xl mb-6 ${iconColor}`}>
        {status === "completed" && "✅"}
        {status === "pending" && "⏳"}
        {(status === "notfound" || !status) && "❓"}
      </div>
      
      <h1 className="text-4xl font-bold mb-4 text-gray-800">{title}</h1>
      <p className="text-lg mb-6 text-gray-600 max-w-md">{desc}</p>
      
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Home
      </button>
      
      {/* Debug info - remove in production */}
      <div className="mt-8 p-4 bg-white rounded border text-xs text-left max-w-md">
        <strong>Debug Info:</strong><br/>
        Status: <code className="bg-gray-100 px-1">{status || 'undefined'}</code><br/>
        Message: <code className="bg-gray-100 px-1">{message || 'undefined'}</code><br/>
        Description: <code className="bg-gray-100 px-1">{description || 'undefined'}</code><br/>
        Original Status: <code className="bg-gray-100 px-1">{originalStatus || 'undefined'}</code>
      </div>
    </div>
  );
};

export default EventStatus;