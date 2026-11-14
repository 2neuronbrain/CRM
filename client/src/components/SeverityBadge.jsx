import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export function SeverityBadge({ severity = 'Unknown', size = 'sm' }) {
  const sev = (severity || 'unknown').toLowerCase();

  let bg = 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50';
  let Icon = HelpCircle;

  if (sev === 'red' || sev === 'critical') {
    bg = 'bg-red-500/10 text-red-400 border-red-500/20';
    Icon = AlertTriangle;
  } else if (sev === 'amber' || sev === 'high' || sev === 'developing') {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    Icon = AlertCircle;
  } else if (sev === 'green' || sev === 'low' || sev === 'healthy') {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
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
