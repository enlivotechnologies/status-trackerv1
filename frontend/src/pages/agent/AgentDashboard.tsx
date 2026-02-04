import { useState } from 'react';
import { leadsAPI, notesAPI, dashboardAPI } from '../../services/api';
import { Lead, LeadStatus, FollowUpStatus } from '../../types';
import DashboardHeader from '../../components/agent/DashboardHeader';
import DashboardOverview from '../../components/agent/DashboardOverview';
import TodaysLeads from '../../components/agent/TodaysLeads';
import ImportantNews from '../../components/agent/ImportantNews';
import AddLeadModal from '../../components/agent/AddLeadModal';
import AddNoteModal from '../../components/agent/AddNoteModal';
import { useDashboardData } from '../../components/agent/hooks/useDashboardData';

const AgentDashboard = () => {
  const { stats, recentLeads, importantNews, isLoading, fetchDashboardData, setRecentLeads, setStats } = useDashboardData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedLeadForNote, setSelectedLeadForNote] = useState<Lead | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateLead = async (formData: any, initialNote: string) => {
    setIsCreating(true);
    try {
      const newLead = await leadsAPI.createLead(formData);
      
      if (initialNote.trim()) {
        try {
          await notesAPI.createNote(newLead.id, initialNote.trim());
        } catch (noteError) {
          console.error('Failed to create initial note:', noteError);
        }
      }
      
      handleCloseModal();
      await fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create lead');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: FollowUpStatus) => {
    try {
      const currentLead = recentLeads.find(lead => lead.id === leadId);
      if (!currentLead) {
        console.error('Lead not found for status update:', leadId);
        return;
      }

      const updateData: any = { followUpStatus: newStatus };
      
      // Handle status changes based on followUpStatus
      // If changing FROM SITE_VISIT_DONE to something else, update the main status appropriately
      if (currentLead.followUpStatus === FollowUpStatus.SITE_VISIT_DONE && newStatus !== FollowUpStatus.SITE_VISIT_DONE) {
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
      else if (newStatus === FollowUpStatus.SITE_VISIT_DONE && currentLead.status !== LeadStatus.SITE_VISIT_DONE) {
        updateData.status = LeadStatus.SITE_VISIT_DONE;
      }
      // If status is "Completed", also update lead status to CLOSED
      else if (newStatus === FollowUpStatus.COMPLETED && currentLead.status !== LeadStatus.CLOSED && currentLead.status !== LeadStatus.LOST) {
        updateData.status = LeadStatus.CLOSED;
      }
      // If status is "Not Negotiable", also update lead status to LOST
      else if (newStatus === FollowUpStatus.NOT_NEGOTIABLE && currentLead.status !== LeadStatus.LOST && currentLead.status !== LeadStatus.CLOSED) {
        updateData.status = LeadStatus.LOST;
      }

      // Optimistically update the UI
      setRecentLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                followUpStatus: newStatus as FollowUpStatus,
                ...(updateData.status ? { status: updateData.status } : {})
              }
            : lead
        )
      );
      
      const updatedLead = await leadsAPI.updateLead(leadId, updateData);
      console.log('Lead updated:', updatedLead);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchDashboardData();
      
      const freshStats = await dashboardAPI.getStats();
      console.log('Dashboard refreshed after status update. Fresh stats:', freshStats);
      setStats(freshStats);
    } catch (error) {
      console.error('Failed to update status:', error);
      await fetchDashboardData();
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDateChange = async (leadId: string, newDate: string) => {
    try {
      const currentLead = recentLeads.find(lead => lead.id === leadId);
      if (!currentLead) {
        console.error('Lead not found for date update:', leadId);
        return;
      }

      // Convert date string to ISO DateTime (set time to start of day)
      const dateObj = new Date(newDate);
      dateObj.setHours(9, 0, 0, 0); // Set to 9 AM
      const isoDateTime = dateObj.toISOString();

      // Update follow-up date AND set followUpStatus to FOLLOW_UP_LATER
      const updateData = { 
        followUpDate: isoDateTime,
        followUpStatus: FollowUpStatus.FOLLOW_UP_LATER
      };

      // Optimistically update the UI
      setRecentLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                followUpDate: isoDateTime,
                followUpStatus: FollowUpStatus.FOLLOW_UP_LATER
              }
            : lead
        )
      );
      
      // Update in database
      await leadsAPI.updateLead(leadId, updateData);
      
      // Refresh data to ensure sync
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchDashboardData();
      
      const freshStats = await dashboardAPI.getStats();
      setStats(freshStats);
    } catch (error) {
      console.error('Failed to update date:', error);
      await fetchDashboardData();
      alert('Failed to update date. Please try again.');
    }
  };

  const handleOpenNoteModal = (lead: Lead) => {
    setSelectedLeadForNote(lead);
    setIsNoteModalOpen(true);
  };

  const handleCloseNoteModal = () => {
    setIsNoteModalOpen(false);
    setSelectedLeadForNote(null);
  };

  const handleAddNote = async (leadId: string, content: string) => {
    setIsAddingNote(true);
    try {
      await notesAPI.createNote(leadId, content);
      handleCloseNoteModal();
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
      throw error;
    } finally {
      setIsAddingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
      <DashboardHeader onAddLeadClick={handleOpenModal} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <DashboardOverview stats={stats} />

        {/* Today's Leads and Important News Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <TodaysLeads 
            leads={recentLeads} 
            onStatusChange={handleStatusChange}
            onDateChange={handleDateChange}
          />
          <ImportantNews news={importantNews} onAddNote={handleOpenNoteModal} />
        </div>
      </main>

      <AddLeadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateLead={handleCreateLead}
        isCreating={isCreating}
      />

      <AddNoteModal
        isOpen={isNoteModalOpen}
        lead={selectedLeadForNote}
        onClose={handleCloseNoteModal}
        onAddNote={handleAddNote}
        isAdding={isAddingNote}
      />
    </div>
  );
};

export default AgentDashboard;
