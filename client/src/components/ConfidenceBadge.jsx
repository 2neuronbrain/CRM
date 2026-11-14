import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, HelpCircle, FileCheck } from 'lucide-react';

export function ConfidenceBadge({ confidence = 'Unknown', size = 'sm' }) {
  const conf = confidence ? confidence.toLowerCase() : 'unknown';

  let bg = 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50';
  let Icon = HelpCircle;

  if (conf.includes('verified')) {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    Icon = ShieldCheck;
  } else if (conf.includes('corroborated')) {
    bg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    Icon = FileCheck;
  } else if (conf.includes('reported')) {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    Icon = ShieldAlert;
  } else if (conf.includes('inferred')) {
    bg = 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    Icon = AlertCircle;
  }

  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium border ${bg} ${px}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="capitalize">{confidence}</span>
    </span>
  );
}

export default ConfidenceBadge;
