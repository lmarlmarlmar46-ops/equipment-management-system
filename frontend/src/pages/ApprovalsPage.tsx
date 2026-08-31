import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function ApprovalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const response = await api.get('/approvals/pending');
      return response.data.data;
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pending Approvals</h1>

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading approvals...</p>
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items?.map((approval: any) => (
            <div key={approval.approvalId} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {approval.request.requestNumber}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Requested by {approval.request.requestedBy.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Estimated cost: ${approval.request.estimatedTotalCost}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-danger">Reject</button>
                  <button className="btn-primary">Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
