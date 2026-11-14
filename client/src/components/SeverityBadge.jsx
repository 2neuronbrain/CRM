import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export function SeverityBadge({ severity = 'Unknown', size = 'sm' }) {
  const sev = (severity || 'unknown').toLowerCase();

  let bg = 'bg-gray-100 text-gray-700 border-gray-200';
  let Icon = HelpCircle;

  if (sev === 'red' || sev === 'critical') {
    bg = 'bg-rose-50 text-rose-700 border-rose-300';
    Icon = AlertTriangle;
  } else if (sev === 'amber' || sev === 'high' || sev === 'developing') {
    bg = 'bg-amber-50 text-amber-700 border-amber-300';
    Icon = AlertCircle;
  } else if (sev === 'green' || sev === 'low' || sev === 'healthy') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    Icon = CheckCircle2;
  }

  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium border ${bg} ${px}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="capitalize">{severity}</span>
    </span>
  );
}

export default SeverityBadge;
