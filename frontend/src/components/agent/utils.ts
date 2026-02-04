import { FollowUpStatus, LeadStatus } from '../../types';

export const formatFollowUpDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date >= today && date < tomorrow) {
    return 'Today';
  }
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).toLowerCase();
  return `${month} ${day}, ${time}`;
};

export const getFollowUpStatusLabel = (status?: FollowUpStatus) => {
  if (!status) return 'Pending';
  const labels: Record<FollowUpStatus, string> = {
    [FollowUpStatus.PENDING]: 'Pending',
    [FollowUpStatus.SELECT_DATE]: 'Select Date',
    [FollowUpStatus.COMPLETED]: 'Completed',
    [FollowUpStatus.NOT_NEGOTIABLE]: 'Not Negotiable',
    [FollowUpStatus.INTERESTED]: 'Interested',
    [FollowUpStatus.FOLLOW_UP_LATER]: 'Follow Up Later',
    [FollowUpStatus.NOT_RESPONDING]: 'Not Responding',
    [FollowUpStatus.SITE_VISIT_DONE]: 'Site Visit Done',
  };
  return labels[status] || 'Pending';
};

export const getLeadStatusLabel = (status: LeadStatus) => {
  const labels: Record<LeadStatus, string> = {
    [LeadStatus.NEW]: 'New',
    [LeadStatus.CONTACTED]: 'Contacted',
    [LeadStatus.SITE_VISIT_DONE]: 'Site Visit Done',
    [LeadStatus.NEGOTIATION]: 'Negotiation',
    [LeadStatus.CLOSED]: 'Closed',
    [LeadStatus.LOST]: 'Lost',
  };
  return labels[status] || status;
};

export const formatLastContacted = (dateString?: string) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
};
