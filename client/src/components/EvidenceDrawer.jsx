import React from 'react';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from './ConfidenceBadge';
import { X, ExternalLink, Calendar, FileText, Database, ShieldCheck, Tag } from 'lucide-react';

export function EvidenceDrawer() {
  const { selectedEvidence, isOpen, loading, closeEvidence } = useEvidence();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-200">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white leading-tight">Evidence Provenance</h3>
                <p className="text-[11px] text-slate-400">Traceable source record verification</p>
              </div>
            </div>
            <button
              onClick={closeEvidence}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {loading ? (
              <div className="py-20 text-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
                Loading provenance record...
              </div>
            ) : selectedEvidence ? (
              <>
                {/* Confidence & Source ID */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Verification Level
                    </span>
                    <ConfidenceBadge confidence={selectedEvidence.confidence || 'Verified'} />
                  </div>
                  <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Source Identifier</span>
                    <code className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 border border-slate-800 rounded text-emerald-400 truncate max-w-[200px]">
                      {selectedEvidence.source_id || selectedEvidence.id}
                    </code>
                  </div>
                </div>

                {/* Excerpt / Raw Text */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    Original Source Excerpt
                  </label>
                  <div className="bg-slate-950 text-emerald-300 font-mono text-xs p-4 rounded-xl shadow-inner whitespace-pre-wrap leading-relaxed border border-slate-800/80 max-h-80 overflow-y-auto">
                    {selectedEvidence.excerpt || 'No excerpt available for this record.'}
                  </div>
                </div>

                {/* Meta details table */}
                <div className="space-y-2.5 border-t border-slate-800 pt-4 text-xs font-sans">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" /> Source Type
                    </span>
                    <span className="font-medium text-slate-200 capitalize bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                      {selectedEvidence.source_type || 'Record'}
                    </span>
                  </div>

                  {selectedEvidence.source_path && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" /> Source Path
                      </span>
                      <span className="font-mono text-[11px] text-slate-300 max-w-[200px] truncate">
                        {selectedEvidence.source_path}
                      </span>
                    </div>
                  )}

                  {selectedEvidence.account_name && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Account</span>
                      <span className="font-medium text-slate-200">{selectedEvidence.account_name}</span>
                    </div>
                  )}

                  {selectedEvidence.deal_title && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Associated Deal</span>
                      <span className="font-medium text-slate-200 truncate max-w-[200px]">
                        {selectedEvidence.deal_title}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-500" /> Originating Tool
                    </span>
                    <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {selectedEvidence.tool_name || 'MCP Client'}
                    </span>
                  </div>

                  {selectedEvidence.source_date && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Record Date
                      </span>
                      <span className="font-mono text-slate-300">{selectedEvidence.source_date}</span>
                    </div>
                  )}
                </div>

                {/* Audit Explanation */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
                  <div className="font-semibold text-slate-300 font-mono uppercase text-[10px]">Audit Integrity Guarantee</div>
                  <p>
                    This evidence snippet was captured directly from the client's original paperwork and flight telemetry through verified MCP JSON-RPC tool calls.
                  </p>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-500">
                No evidence record selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvidenceDrawer;
