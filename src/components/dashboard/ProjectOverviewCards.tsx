import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

interface ProjectOverviewCardsProps {
  className?: string;
}

export const ProjectOverviewCards: React.FC<ProjectOverviewCardsProps> = ({ className }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ''}`}>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Team Members</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};