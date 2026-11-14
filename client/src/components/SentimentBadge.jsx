import React from 'react';
import { Smile, Meh, Frown, AlertCircle } from 'lucide-react';

export function SentimentBadge({ status = 'Neutral', score = null, size = 'sm' }) {
  const s = (status || '').toLowerCase();

  let bg = 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50';
  let Icon = Meh;

  if (s.includes('support') || s.includes('positive') || s.includes('warm') || s.includes('healthy')) {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    Icon = Smile;
  } else if (s.includes('guard') || s.includes('frustrat') || s.includes('deteriorat') || s.includes('risk') || s.includes('critical')) {
    bg = 'bg-red-500/10 text-red-400 border-red-500/20';
    Icon = Frown;
  } else if (s.includes('disengag') || s.includes('drift') || s.includes('warning') || s.includes('freeze') || s.includes('watch')) {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
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
