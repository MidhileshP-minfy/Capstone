import React from 'react';
import { Users } from 'lucide-react';
import { useCollaboration } from './CollaborationProvider';

const ActiveUsers = () => {
  const { activeUsers } = useCollaboration();

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-secondary-800 rounded-lg px-3 py-2 shadow-sm border border-primary-200 dark:border-secondary-700">
      <Users className="h-4 w-4 text-secondary-600 dark:text-primary-300" />
      <span className="text-sm text-secondary-600 dark:text-primary-300">
        {activeUsers.length} active
      </span>
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800 flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {activeUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-secondary-800 bg-secondary-400 flex items-center justify-center text-xs font-medium text-white">
            +{activeUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveUsers;