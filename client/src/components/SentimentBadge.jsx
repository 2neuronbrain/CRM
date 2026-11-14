import React from 'react';
import { Smile, Meh, Frown, AlertCircle } from 'lucide-react';

export function SentimentBadge({ status = 'Neutral', score = null, size = 'sm' }) {
  const s = (status || '').toLowerCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Meh;

  if (s.includes('support') || s.includes('positive') || s.includes('warm')) {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    Icon = Smile;
  } else if (s.includes('guard') || s.includes('frustrat') || s.includes('deteriorat') || s.includes('risk') || s.includes('freeze')) {
    bg = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = Frown;
  } else if (s.includes('disengag') || s.includes('drift') || s.includes('warning')) {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertCircle;
  }

  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium border ${bg} ${px}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
      {score !== null && (
        <span className="font-mono text-[10px] opacity-75">({score}/100)</span>
      )}
    </span>
  );
}

export default SentimentBadge;
