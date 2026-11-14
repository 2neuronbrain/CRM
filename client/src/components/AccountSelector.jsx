import React, { useState, useEffect, useRef } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';

export function AccountSelector({
  value = 'ALL',
  onChange,
  className = '',
  includeAll = true,
  allLabel = 'All Accounts',
  size = 'md'
}) {
  const [accounts, setAccounts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setAccounts(data);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedAccount = accounts.find(a => (a.accountId || a.id) === value);
  const displayLabel = value === 'ALL' 
    ? allLabel 
    : (selectedAccount ? selectedAccount.name : `Account ${value}`);

  const py = size === 'sm' ? 'py-1 px-2.5 text-xs' : 'py-1.5 px-3 text-xs';

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-200 rounded-lg border border-zinc-700/60 font-medium transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${py}`}
      >
        <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="truncate max-w-[180px]">{displayLabel}</span>
        {value !== 'ALL' && (
          <span className="font-mono text-[10px] px-1 py-0.2 bg-blue-500/15 text-blue-400 rounded">
            {value}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 ml-1 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-1 w-64 bg-zinc-800 border border-zinc-700/80 rounded-xl shadow-xl py-1.5 z-50 text-xs text-zinc-200 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
            Filter by Account
          </div>

          {includeAll && (
            <button
              type="button"
              onClick={() => {
                onChange('ALL');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-700/60 transition-colors text-left ${
                value === 'ALL' ? 'text-blue-400 font-semibold bg-blue-500/10' : 'text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>{allLabel}</span>
              </div>
              {value === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          )}

          <div className="border-t border-zinc-700/50 my-1" />

          <div className="max-h-60 overflow-y-auto">
            {accounts.map((acc) => {
              const accId = acc.accountId || acc.id;
              const isSelected = value === accId;
              return (
                <button
                  key={accId}
                  type="button"
                  onClick={() => {
                    onChange(accId);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-700/60 transition-colors text-left ${
                    isSelected ? 'text-blue-400 font-semibold bg-blue-500/10' : 'text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] px-1 py-0.2 bg-zinc-900 text-zinc-400 rounded border border-zinc-700/60 font-semibold">
                        {accId}
                      </span>
                      <span className="truncate font-medium text-zinc-200">{acc.name}</span>
                    </div>
                    {acc.industry && (
                      <span className="text-[10px] text-zinc-500 block truncate ml-1">
                        {acc.industry}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountSelector;
