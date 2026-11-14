import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, HelpCircle, FileCheck } from 'lucide-react';

export function ConfidenceBadge({ confidence = 'Unknown', size = 'sm' }) {
  const conf = confidence ? confidence.toLowerCase() : 'unknown';

  let bg = 'bg-gray-100 text-gray-700 border-gray-200';
  let Icon = HelpCircle;

  if (conf.includes('verified')) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    Icon = ShieldCheck;
  } else if (conf.includes('corroborated')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-300';
    Icon = FileCheck;
  } else if (conf.includes('reported')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-300';
    Icon = ShieldAlert;
  } else if (conf.includes('inferred')) {
    bg = 'bg-purple-50 text-purple-700 border-purple-300';
    Icon = AlertCircle;
  }

  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium border ${bg} ${px}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="capitalize">{confidence}</span>
    </span>
  );
}

export default ConfidenceBadge;
