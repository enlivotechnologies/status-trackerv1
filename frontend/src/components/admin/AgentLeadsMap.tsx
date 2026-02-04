import { Lead } from '../../types';

interface AgentLeadsMapProps {
  leads: Lead[];
}

// Simple map component that shows lead locations grouped by location
const AgentLeadsMap = ({ leads }: AgentLeadsMapProps) => {
  // Get unique locations from leads
  const locations = leads
    .filter(lead => lead.location)
    .map(lead => ({
      name: lead.name,
      location: lead.location || '',
      phone: lead.phone,
      project: lead.project || 'N/A'
    }));

  // Group leads by location
  const locationGroups = locations.reduce((acc, lead) => {
    const loc = lead.location.toLowerCase().trim();
    if (!acc[loc]) {
      acc[loc] = [];
    }
    acc[loc].push(lead);
    return acc;
  }, {} as Record<string, typeof locations>);

  const uniqueLocations = Object.keys(locationGroups);

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="mt-2 text-sm text-gray-500">No leads with location data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Location Summary */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Lead Locations</h4>
          <span className="text-xs text-gray-500">{uniqueLocations.length} unique locations</span>
        </div>
      </div>
      
      {/* Location Cards Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
        {uniqueLocations.map((location, index) => {
          const leadsInLocation = locationGroups[location];
          return (
            <div 
              key={index}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200"
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate capitalize">
                    {location}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {leadsInLocation.length} lead{leadsInLocation.length > 1 ? 's' : ''}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {leadsInLocation.slice(0, 3).map((lead, i) => (
                      <p key={i} className="text-xs text-gray-600 truncate">
                        • {lead.name}
                      </p>
                    ))}
                    {leadsInLocation.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{leadsInLocation.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Leads without location */}
      {leads.filter(l => !l.location).length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {leads.filter(l => !l.location).length} leads without location data
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentLeadsMap;
