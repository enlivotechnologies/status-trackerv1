import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leadsAPI } from "../../services/api";
import { Lead, LeadStatus } from "../../types";

const AdminLeadsList = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const CACHE_KEY = "adminLeadsCache:v1";
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const hasCache = loadFromCache();
    fetchLeads(!hasCache);
  }, []);

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;
      const parsed = JSON.parse(cached) as { timestamp: number; leads: Lead[] };
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return false;
      setLeads(parsed.leads || []);
      setIsLoading(false);
      return true;
    } catch {
      return false;
    }
  };

  const fetchLeads = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      const data = await leadsAPI.getAllLeads();
      setLeads(data);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), leads: data }),
      );
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      NEW: "bg-gray-100 text-gray-700",
      CONTACTED: "bg-blue-100 text-blue-700",
      SITE_VISIT_DONE: "bg-green-100 text-green-700",
      NEGOTIATION: "bg-yellow-100 text-yellow-700",
      CLOSED: "bg-purple-100 text-purple-700",
      LOST: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FAF9F6" }}
      >
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F6" }}>
      {/* Top Header Section */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
          {/* Left Side - Logo and Welcome Message */}
          <div className="flex items-center space-x-4">
            {/* Logo/Icon */}
            <div className="flex-shrink-0">
              <img
                src="https://i.pinimg.com/1200x/7a/a1/d2/7aa1d2d02f060691bf7f5a3b76487a02.jpg"
                alt="Logo"
                className="h-12 w-12 object-contain rounded-lg"
              />
            </div>

            {/* Welcome Message */}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">All Leads</h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage all leads across all agents
              </p>
            </div>
          </div>

          {/* Right Side - Back Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {leads.length === 0 ? (
          <div
            className="rounded-xl shadow-sm border border-gray-200/60 p-12 text-center"
            style={{ backgroundColor: "#FEFDFB" }}
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-400">No leads found</p>
          </div>
        ) : (
          <div
            className="rounded-xl shadow-sm border border-gray-200/60 overflow-hidden"
            style={{ backgroundColor: "#FEFDFB" }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200/60">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Lead Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Project/Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Follow-up
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/agent/lead/${lead.id}`)}
                      className={`border-b border-gray-100/50 transition-all duration-200 cursor-pointer ${
                        index === leads.length - 1 ? "border-b-0" : ""
                      } hover:bg-gray-50/40`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-sm font-medium text-white">
                              {lead.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {lead.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lead.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-xs font-medium text-gray-700">
                              {(lead.assignedTo?.name || "Unknown")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            {lead.assignedTo?.name || "Unknown"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {lead.project || lead.location || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}
                        >
                          {lead.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {formatDate(lead.followUpDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLeadsList;
