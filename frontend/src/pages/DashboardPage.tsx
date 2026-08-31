import { useQuery } from '@tanstack/react-query';
import {
  CubeIcon,
  ClockIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import api from '../lib/api';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    }
  });

  const statCards = [
    {
      name: 'Total Assets',
      value: stats?.totalAssets?.count || 0,
      subtext: `$${(stats?.totalAssets?.value || 0).toLocaleString()}`,
      icon: CubeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Pending Requests',
      value: stats?.pendingRequests || 0,
      subtext: 'Awaiting approval',
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'My Approvals',
      value: stats?.pendingApprovals || 0,
      subtext: 'Need your action',
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Maintenance Tickets',
      value: stats?.openMaintenanceTickets || 0,
      subtext: 'Open tickets',
      icon: WrenchScrewdriverIcon,
      color: 'bg-red-500'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your equipment management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment by Status</h3>
          <div className="space-y-3">
            {stats?.equipmentByStatus && Object.entries(stats.equipmentByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{status.replace('_', ' ')}</span>
                <span className="badge badge-info">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Allocation Rate</span>
              <span className="text-lg font-bold text-gray-900">{stats?.allocationRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Avg Allocation Time</span>
              <span className="text-lg font-bold text-gray-900">{stats?.averageAllocationTimeDays || 0} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Maintenance Cost (MTD)</span>
              <span className="text-lg font-bold text-gray-900">${(stats?.maintenanceCostMtd || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
