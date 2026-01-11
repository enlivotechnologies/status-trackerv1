import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { LeadStatus, WorkStatus, UserRole, FollowUpStatus } from '@prisma/client';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Ensure database connection is active
    await prisma.$connect().catch(() => {
      // Connection might already be established, ignore error
    });
    const where: any = {};

    // Agents only see their own stats
    if (req.userRole === 'AGENT') {
      where.assignedToId = req.userId;
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total leads
    const totalLeads = await prisma.lead.count({ where });

    // Follow-ups due today
    const followUpsToday = await prisma.lead.count({
      where: {
        ...where,
        followUpDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Site visits done (this month)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const siteVisitsDone = await prisma.lead.count({
      where: {
        ...where,
        status: LeadStatus.SITE_VISIT_DONE,
        updatedAt: {
          gte: startOfMonth
        }
      }
    });

    // Deals closed - count leads that have followUpStatus = COMPLETED
    // This is the most accurate way to count completed deals since we mark leads as COMPLETED
    // when they are done, which also updates status to CLOSED
    const dealsClosed = await prisma.lead.count({
      where: {
        ...where,
        followUpStatus: FollowUpStatus.COMPLETED
      }
    });
    
    // Also get the actual closed leads for debugging
    const closedLeads = await prisma.lead.findMany({
      where: {
        ...where,
        followUpStatus: FollowUpStatus.COMPLETED
      },
      select: {
        id: true,
        name: true,
        status: true,
        followUpStatus: true,
        updatedAt: true
      }
    });
    
    console.log(`Deals closed count for user ${req.userId}: ${dealsClosed} (followUpStatus = COMPLETED)`);
    console.log(`Closed leads:`, closedLeads.map(l => ({ id: l.id, name: l.name, status: l.status, followUpStatus: l.followUpStatus, updatedAt: l.updatedAt })));

    // Pending works - count works from previous days (before today) that are not completed
    // A work is pending if: 
    // 1. status = PENDING AND completedAt is null
    // 2. dueDate < today (only previous days, not today or future)
    // 3. AND the associated lead's followUpStatus is NOT COMPLETED and NOT NOT_NEGOTIABLE
    // (null followUpStatus is allowed - it means pending)
    
    // Get today's start date (00:00:00)
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    // First, get all pending works from previous days only
    const workBaseWhere: any = {
      status: WorkStatus.PENDING,
      completedAt: null,
      dueDate: {
        lt: todayStart // Only works due before today
      }
    };

    // Agents only see their own pending work
    if (req.userRole === 'AGENT') {
      workBaseWhere.assignedToId = req.userId;
    }

    // Fetch works with their leads to filter by followUpStatus
    let allPendingWorks = [];
    try {
      allPendingWorks = await prisma.work.findMany({
        where: workBaseWhere,
        select: {
          id: true,
          dueDate: true,
          lead: {
            select: {
              followUpStatus: true
            }
          }
        }
      });
    } catch (error) {
      console.error('[Dashboard] Error fetching pending works:', error);
      allPendingWorks = [];
    }

    // Filter out works where lead's followUpStatus is COMPLETED or NOT_NEGOTIABLE
    const filteredPendingWorks = allPendingWorks.filter(work => {
      // Safety check: if lead doesn't exist, include the work (shouldn't happen but be safe)
      if (!work || !work.lead) {
        return true;
      }
      const followUpStatus = work.lead.followUpStatus;
      return followUpStatus !== FollowUpStatus.COMPLETED && 
             followUpStatus !== FollowUpStatus.NOT_NEGOTIABLE;
    });

    const pendingWorks = filteredPendingWorks.length;
    
    // Ensure pendingWorks is always a number
    const pendingWorksCount = Number(pendingWorks) || 0;
    
    // Also get the actual pending works for debugging
    const pendingWorksList = await prisma.work.findMany({
      where: workBaseWhere,
      select: {
        id: true,
        title: true,
        status: true,
        completedAt: true,
        assignedToId: true,
        dueDate: true,
        lead: {
          select: {
            followUpStatus: true
          }
        }
      }
    }).catch(() => []);

    // Filter the list for debugging
    const filteredPendingWorksList = pendingWorksList.filter(work => {
      // Safety check: if lead doesn't exist, include the work (shouldn't happen but be safe)
      if (!work || !work.lead) {
        return true;
      }
      const followUpStatus = work.lead.followUpStatus;
      return followUpStatus !== FollowUpStatus.COMPLETED && 
             followUpStatus !== FollowUpStatus.NOT_NEGOTIABLE;
    });
    
    console.log(`[Dashboard] Pending works count for user ${req.userId} (${req.userRole}): ${pendingWorksCount}`);
    console.log(`[Dashboard] Pending works details:`, filteredPendingWorksList.map((w: any) => ({ id: w.id, title: w.title, status: w.status, completedAt: w.completedAt, assignedToId: w.assignedToId })));

    // Admin-specific stats
    let totalAgents = 0;
    let totalLeadsGenerated = 0;
    let completedLeads = 0;
    let activeAgents = 0;
    let averageLeadsPerAgent = 0;
    let conversionRate = 0;
    let followUpsCompletedToday = 0;
    let leadsUpdatedToday = 0;
    let newContactsToday = 0;
    let activityRate = 0;
    let leadsCreatedToday = 0;

    if (req.userRole === 'ADMIN') {
      // Total agents count
      totalAgents = await prisma.user.count({
        where: {
          role: UserRole.AGENT
        }
      });

      // Total leads generated by all agents (all time)
      totalLeadsGenerated = await prisma.lead.count({});

      // Leads created today
      leadsCreatedToday = await prisma.lead.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      // Active agents (agents who have created leads in the last 7 days)
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeAgentIds = await prisma.lead.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        },
        select: {
          assignedToId: true
        },
        distinct: ['assignedToId']
      });
      activeAgents = activeAgentIds.length;

      // Average leads per agent (all time)
      if (totalAgents > 0) {
        averageLeadsPerAgent = Math.round((totalLeadsGenerated / totalAgents) * 10) / 10;
      }

      // Completed leads (leads that have reached advanced stages)
      completedLeads = await prisma.lead.count({
        where: {
          status: {
            in: [LeadStatus.SITE_VISIT_DONE, LeadStatus.NEGOTIATION, LeadStatus.CLOSED]
          }
        }
      });

      // Conversion rate (closed deals / total leads * 100)
      if (totalLeadsGenerated > 0) {
        const closedDeals = await prisma.lead.count({
          where: {
            status: LeadStatus.CLOSED
          }
        });
        conversionRate = Math.round((closedDeals / totalLeadsGenerated) * 100 * 10) / 10;
      }

      // Follow-ups completed today (leads updated today that had follow-up date today)
      const followUpsCompletedToday = await prisma.lead.count({
        where: {
          followUpDate: {
            gte: today,
            lt: tomorrow
          },
          updatedAt: {
            gte: today,
            lt: tomorrow
          },
          status: {
            not: LeadStatus.NEW
          }
        }
      });

      // Leads updated today (shows agent activity)
      const leadsUpdatedToday = await prisma.lead.count({
        where: {
          updatedAt: {
            gte: today,
            lt: tomorrow
          },
          createdAt: {
            lt: today // Exclude newly created leads
          }
        }
      });

      // New contacts today (leads moved from NEW to CONTACTED today)
      const newContactsToday = await prisma.lead.count({
        where: {
          status: LeadStatus.CONTACTED,
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      // Activity rate (percentage of agents who updated leads today)
      const agentsWithActivityToday = await prisma.lead.findMany({
        where: {
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        },
        select: {
          assignedToId: true
        },
        distinct: ['assignedToId']
      });
      
      let activityRate = 0;
      if (totalAgents > 0) {
        activityRate = Math.round((agentsWithActivityToday.length / totalAgents) * 100 * 10) / 10;
      }
    }

    const response: any = {
      totalLeads,
      followUpsToday,
      siteVisitsDone,
      dealsClosed,
      pendingWorks: pendingWorksCount
    };

    // Add admin-specific stats
    if (req.userRole === 'ADMIN') {
      response.totalAgents = totalAgents;
      response.totalLeadsGenerated = totalLeadsGenerated;
      response.completedLeads = completedLeads;
      response.activeAgents = activeAgents;
      response.averageLeadsPerAgent = averageLeadsPerAgent;
      response.conversionRate = conversionRate;
      response.followUpsCompletedToday = followUpsCompletedToday;
      response.leadsUpdatedToday = leadsUpdatedToday;
      response.newContactsToday = newContactsToday;
      response.activityRate = activityRate;
      response.leadsCreatedToday = leadsCreatedToday;
    }

    res.json(response);
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

export const getAgentOverview = async (req: AuthRequest, res: Response) => {
  try {
    // Only admin can access this
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate week start (Monday)
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Calculate month start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Get all agents
    const agents = await prisma.user.findMany({
      where: {
        role: UserRole.AGENT
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Get statistics for each agent
    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        // Leads generated today
        const leadsToday = await prisma.lead.count({
          where: {
            assignedToId: agent.id,
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        });

        // Leads generated this week
        const leadsWeek = await prisma.lead.count({
          where: {
            assignedToId: agent.id,
            createdAt: {
              gte: weekStart,
              lt: weekEnd
            }
          }
        });

        // Leads generated this month
        const leadsMonth = await prisma.lead.count({
          where: {
            assignedToId: agent.id,
            createdAt: {
              gte: monthStart,
              lt: monthEnd
            }
          }
        });

        // Pending leads (not closed, not lost)
        const pendingLeads = await prisma.lead.count({
          where: {
            assignedToId: agent.id,
            status: {
              notIn: [LeadStatus.CLOSED, LeadStatus.LOST]
            }
          }
        });

        // Completed leads (advanced stages)
        const completedLeads = await prisma.lead.count({
          where: {
            assignedToId: agent.id,
            status: {
              in: [LeadStatus.SITE_VISIT_DONE, LeadStatus.NEGOTIATION, LeadStatus.CLOSED]
            }
          }
        });

        // Pending works for this agent
        // Count works that are:
        // 1. status = PENDING AND completedAt = null
        // 2. dueDate < today (only previous days, not today or future)
        // 3. AND the associated lead's followUpStatus is NOT COMPLETED and NOT NOT_NEGOTIABLE
        // (null followUpStatus is allowed - it means pending)
        let agentPendingWorks = [];
        try {
          agentPendingWorks = await prisma.work.findMany({
            where: {
              assignedToId: agent.id,
              status: WorkStatus.PENDING,
              completedAt: null,
              dueDate: {
                lt: today // Only works due before today
              }
            },
            select: {
              id: true,
              dueDate: true,
              lead: {
                select: {
                  followUpStatus: true
                }
              }
            }
          });
        } catch (error) {
          console.error(`[Agent Overview] Error fetching pending works for agent ${agent.id}:`, error);
          agentPendingWorks = [];
        }

        // Filter out works where lead's followUpStatus is COMPLETED or NOT_NEGOTIABLE
        const pendingWorks = agentPendingWorks.filter(work => {
          // Safety check: if lead doesn't exist, include the work (shouldn't happen but be safe)
          if (!work || !work.lead) {
            return true;
          }
          const followUpStatus = work.lead.followUpStatus;
          return followUpStatus !== FollowUpStatus.COMPLETED && 
                 followUpStatus !== FollowUpStatus.NOT_NEGOTIABLE;
        }).length;

        return {
          agentId: agent.id,
          agentName: agent.name,
          agentEmail: agent.email,
          leadsToday,
          leadsWeek,
          leadsMonth,
          pending: pendingWorks, // Pending column now shows pending works count
          completed: completedLeads,
          pendingWorks: pendingWorks // Keep for backward compatibility
        };
      })
    );

    res.json(agentStats);
  } catch (error: any) {
    console.error('Get agent overview error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};
