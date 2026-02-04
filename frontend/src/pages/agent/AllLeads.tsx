import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leadsAPI } from "../../services/api";
import { Lead, FollowUpStatus, LeadStatus } from "../../types";
import {
  getFollowUpStatusLabel,
  formatLastContacted,
} from "../../components/agent/utils";

// Helper function to check if a lead is overdue
const isLeadOverdue = (lead: Lead): boolean => {
  if (!lead.followUpDate) return false;
  // If status is Closed or Lost, it's not overdue
  if (lead.status === LeadStatus.CLOSED || lead.status === LeadStatus.LOST)
    return false;
  // If followUpStatus is COMPLETED or NOT_NEGOTIABLE, it's not overdue
  if (
    lead.followUpStatus === FollowUpStatus.COMPLETED ||
    lead.followUpStatus === FollowUpStatus.NOT_NEGOTIABLE
  )
    return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpDate = new Date(lead.followUpDate);
  followUpDate.setHours(0, 0, 0, 0);

  return followUpDate < today;
};

const AllLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "week" | "month" | "all">(
    "today",
  );
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  const CACHE_KEY = "agentAllLeadsCache:v1";
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const hasCache = loadFromCache();
    fetchLeads(!hasCache);
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, filter]);

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
      const allLeads = await leadsAPI.getLeads();
      setLeads(allLeads);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), leads: allLeads }),
      );
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  const filterLeads = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered: Lead[] = [];

    switch (filter) {
      case "today":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt || "");
          return leadDate >= today && leadDate < tomorrow;
        });
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt || "");
          return leadDate >= weekAgo;
        });
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt || "");
          return leadDate >= monthAgo;
        });
        break;
      case "all":
        filtered = leads;
        break;
    }

    // Sort by most recent first
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime(),
    );
    setFilteredLeads(filtered);
  };

  const formatFollowUpDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date >= today && date < tomorrow) {
      return "Today";
    }
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const time = date
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
    return `${month} ${day}, ${time}`;
  };

  const handleStatusChange = async (
    leadId: string,
    newStatus: FollowUpStatus,
  ) => {
    try {
      // Find the current lead to get its existing status
      const currentLead = filteredLeads.find((lead) => lead.id === leadId);
      if (!currentLead) {
        console.error("Lead not found for status update:", leadId);
        return;
      }

      // Prepare update data
      const updateData: any = { followUpStatus: newStatus };

      // Handle status changes based on followUpStatus
      // If changing FROM SITE_VISIT_DONE to something else, update the main status appropriately
      if (
        currentLead.followUpStatus === FollowUpStatus.SITE_VISIT_DONE &&
        newStatus !== FollowUpStatus.SITE_VISIT_DONE
      ) {
        // If currently SITE_VISIT_DONE and changing to something else, update main status
        if (newStatus === FollowUpStatus.COMPLETED) {
          updateData.status = LeadStatus.CLOSED;
        } else if (newStatus === FollowUpStatus.NOT_NEGOTIABLE) {
          updateData.status = LeadStatus.LOST;
        } else {
          // For other statuses (Interested, Select Date, etc.), move back to CONTACTED
          updateData.status = LeadStatus.CONTACTED;
        }
      }
      // If status is "Site Visit Done", also update lead status to SITE_VISIT_DONE
      else if (
        newStatus === FollowUpStatus.SITE_VISIT_DONE &&
        currentLead.status !== LeadStatus.SITE_VISIT_DONE
      ) {
        updateData.status = LeadStatus.SITE_VISIT_DONE;
      }
      // If follow-up status is COMPLETED, also update lead status to CLOSED
      // This ensures the backend receives the status update explicitly
      else if (
        newStatus === FollowUpStatus.COMPLETED &&
        currentLead.status !== LeadStatus.CLOSED &&
        currentLead.status !== LeadStatus.LOST
      ) {
        updateData.status = LeadStatus.CLOSED;
      }
      // If status is "Not Negotiable", also update lead status to LOST
      else if (
        newStatus === FollowUpStatus.NOT_NEGOTIABLE &&
        currentLead.status !== LeadStatus.LOST &&
        currentLead.status !== LeadStatus.CLOSED
      ) {
        updateData.status = LeadStatus.LOST;
      }

      // Optimistically update the UI
      setFilteredLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                followUpStatus: newStatus as FollowUpStatus,
                ...(updateData.status ? { status: updateData.status } : {}),
              }
            : lead,
        ),
      );

      // Update in database - backend will also handle status update
      await leadsAPI.updateLead(leadId, updateData);

      // Refresh data to ensure sync with NeonDB
      await fetchLeads();
    } catch (error) {
      console.error("Failed to update status:", error);
      // Revert on error by refreshing from database
      await fetchLeads();
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDateChange = async (leadId: string, newDate: string) => {
    try {
      const currentLead = filteredLeads.find((lead) => lead.id === leadId);
      if (!currentLead) {
        console.error("Lead not found for date update:", leadId);
        return;
      }

      // Convert date string to ISO DateTime (set time to start of day)
      const dateObj = new Date(newDate);
      dateObj.setHours(9, 0, 0, 0); // Set to 9 AM
      const isoDateTime = dateObj.toISOString();

      // Show notification
      const formattedDate = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      setShowNotification(`New follow-up date selected: ${formattedDate}`);
      setTimeout(() => setShowNotification(null), 3000);

      // Update follow-up date AND set followUpStatus to FOLLOW_UP_LATER
      const updateData = {
        followUpDate: isoDateTime,
        followUpStatus: FollowUpStatus.FOLLOW_UP_LATER,
      };

      // Optimistically update the UI
      setFilteredLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                followUpDate: isoDateTime,
                followUpStatus: FollowUpStatus.FOLLOW_UP_LATER,
              }
            : lead,
        ),
      );

      // Update in database
      await leadsAPI.updateLead(leadId, updateData);

      // Refresh data to ensure sync
      await fetchLeads();
    } catch (error) {
      console.error("Failed to update date:", error);
      await fetchLeads();
      alert("Failed to update date. Please try again.");
    }
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
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{showNotification}</span>
        </div>
      )}

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
            </div>
          </div>

          {/* Right Side - Notifications and Back Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/agent/notifications")}
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
              title="Notifications"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <button
              onClick={() => navigate("/agent")}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
            >
              ← Today's Calls
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "today"
                  ? "bg-gradient-to-b from-yellow-500 to-yellow-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter("week")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "week"
                  ? "bg-gradient-to-b from-yellow-500 to-yellow-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilter("month")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "month"
                  ? "bg-gradient-to-b from-yellow-500 to-yellow-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "all"
                  ? "bg-gradient-to-b from-yellow-500 to-yellow-400 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              All Leads
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div
          className="rounded-xl shadow-sm p-6 border border-black/10"
          style={{ backgroundColor: "#FEFDFB" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {filter === "today"
                ? "Today's Leads"
                : filter === "week"
                  ? "This Week's Leads"
                  : filter === "month"
                    ? "This Month's Leads"
                    : "All Leads"}{" "}
              ({filteredLeads.length})
            </h3>
          </div>

          {filteredLeads.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {filter === "today"
                ? "No leads created today"
                : filter === "week"
                  ? "No leads this week"
                  : filter === "month"
                    ? "No leads this month"
                    : "No leads found"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow up
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contacted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time & Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => {
                    const overdue = isLeadOverdue(lead);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => navigate(`/agent/lead/${lead.id}`)}
                        className={`cursor-pointer ${overdue ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${overdue ? "bg-red-300" : "bg-gray-300"}`}
                            >
                              <span
                                className={`text-xs font-medium ${overdue ? "text-red-800" : "text-gray-700"}`}
                              >
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div
                                className={`text-sm font-medium ${overdue ? "text-red-900" : "text-gray-900"}`}
                              >
                                {lead.name}
                              </div>
                              {overdue && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div
                            className={`text-sm ${overdue ? "text-red-700 font-bold" : "text-gray-900"}`}
                          >
                            {formatFollowUpDate(lead.followUpDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {showDatePicker === lead.id ? (
                            <div className="relative">
                              <input
                                type="date"
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleDateChange(lead.id, e.target.value);
                                    setShowDatePicker(null);
                                  }
                                }}
                                onBlur={() => {
                                  setTimeout(
                                    () => setShowDatePicker(null),
                                    300,
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="text-xs px-3 py-1.5 rounded-lg border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-gray-900 cursor-pointer min-w-[160px] font-medium"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <select
                                value={
                                  lead.followUpStatus || FollowUpStatus.PENDING
                                }
                                onChange={(e) => {
                                  const newStatus = e.target
                                    .value as FollowUpStatus;
                                  if (
                                    newStatus === FollowUpStatus.FOLLOW_UP_LATER
                                  ) {
                                    setShowDatePicker(lead.id);
                                  } else {
                                    handleStatusChange(lead.id, newStatus);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-gray-900 cursor-pointer min-w-[140px] font-medium"
                              >
                                {Object.values(FollowUpStatus)
                                  .filter(
                                    (status) =>
                                      status !== FollowUpStatus.SELECT_DATE,
                                  )
                                  .map((status) => (
                                    <option key={status} value={status}>
                                      {getFollowUpStatusLabel(status)}
                                    </option>
                                  ))}
                              </select>
                              {lead.followUpStatus ===
                                FollowUpStatus.FOLLOW_UP_LATER && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDatePicker(lead.id);
                                  }}
                                  className="p-1 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition-colors"
                                  title="Change follow-up date"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div
                            className={`text-sm ${!lead.lastContactedDate ? "text-red-500 font-medium" : "text-gray-900"}`}
                          >
                            {formatLastContacted(lead.lastContactedDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {lead.createdAt
                              ? formatDateTime(lead.createdAt)
                              : "N/A"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllLeads;
