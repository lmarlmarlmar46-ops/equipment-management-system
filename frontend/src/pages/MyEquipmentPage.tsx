import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import api from '../lib/api';

export default function MyEquipmentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-equipment'],
    queryFn: async () => {
      const response = await api.get('/assignments?status=ACTIVE');
      return response.data.data;
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Equipment</h1>

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading your equipment...</p>
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">You don't have any equipment assigned</p>
          <button className="btn-primary mt-4">Request Equipment</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.items?.map((assignment: any) => (
            <div key={assignment.assignmentId} className="card">
              <div className="flex justify-center mb-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    equipmentId: assignment.equipment?.equipmentId,
                    assetTag: assignment.equipment?.assetTag
                  })}
                  size={120}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center">
                {assignment.equipment?.modelName}
              </h3>
              <p className="text-sm text-gray-600 text-center mt-1">
                {assignment.equipment?.assetTag}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-medium">{new Date(assignment.assignmentDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Condition:</span>
                  <span className="badge badge-success">{assignment.equipment?.conditionRating}</span>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="btn-secondary flex-1">Report Issue</button>
                <button className="btn-secondary flex-1">Return</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
