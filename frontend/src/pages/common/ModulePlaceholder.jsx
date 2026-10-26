import React from 'react';
import { Layers } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function ModulePlaceholder({ title, description, phase, icon: Icon = Layers }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <Badge variant="primary" size="md">
          {phase}
        </Badge>
      </div>

      <Card>
        <div className="text-center py-16 px-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title} Module</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Database models and backend structures are established. Complete UI and API integration is scheduled for {phase}.
          </p>
        </div>
      </Card>
    </div>
  );
}
