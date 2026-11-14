import React from 'react';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from './ConfidenceBadge';
import { X, Calendar, FileText, Database, ShieldCheck, Loader2 } from 'lucide-react';

export function EvidenceDrawer() {
  const { selectedEvidence, isOpen, loading, closeEvidence } = useEvidence();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col text-zinc-200">
          {/* Header */}
          <div className="px-5 py-4 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-100 leading-tight">Evidence Provenance</h3>
                <p className="text-[11px] text-zinc-500">Traceable source record verification</p>
              </div>
            </div>
            <button
              onClick={closeEvidence}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {loading ? (
              <div className="py-20 text-center text-zinc-500 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
                <p className="text-xs">Loading provenance record...</p>
              </div>
            ) : selectedEvidence ? (
              <>
                {/* Confidence & Source ID */}
                <div className="bg-zinc-850 bg-zinc-950/60 border border-zinc-800/70 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                      Verification Level
                    </span>
                    <ConfidenceBadge confidence={selectedEvidence.confidence || 'Verified'} size="xs" />
                  </div>
                  <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-zinc-400">Source Identifier</span>
                    <code className="text-xs font-mono font-semibold bg-zinc-900 px-2 py-0.5 border border-zinc-700/60 rounded text-blue-400 truncate max-w-[200px]">
                      {selectedEvidence.source_id || selectedEvidence.id}
                    </code>
                  </div>
                </div>

                {/* Excerpt / Raw Text */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block font-mono">
                    Unedited Source Excerpt
                  </span>
                  <div className="p-3.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-zinc-300 leading-relaxed font-mono text-[11px] max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
                    {selectedEvidence.excerpt || 'No excerpt available.'}
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="bg-zinc-950/60 border border-zinc-800/70 rounded-xl p-3.5 space-y-2 text-zinc-400">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Retrieved Via:</span>
                    </span>
                    <span className="font-mono text-zinc-300">{selectedEvidence.tool_name || 'MCP Tool'}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Source Type:</span>
                    </span>
                    <span className="font-mono uppercase text-zinc-300">{selectedEvidence.source_type || 'Paperwork'}</span>
                  </div>

                  {selectedEvidence.source_date && (
                    <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Source Timestamp:</span>
                      </span>
                      <span className="font-mono text-zinc-300">{selectedEvidence.source_date}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Archived At:</span>
                    </span>
                    <span className="font-mono text-zinc-300">
                      {selectedEvidence.retrieved_at ? new Date(selectedEvidence.retrieved_at).toLocaleString() : 'Live'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-zinc-500 text-xs">
                No evidence record selected.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-zinc-900 border-t border-zinc-800/80 text-right">
            <button
              onClick={closeEvidence}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700/60 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvidenceDrawer;
