import React from 'react';
import { useEvidence } from '../context/EvidenceContext';
import ConfidenceBadge from './ConfidenceBadge';
import { X, ExternalLink, Calendar, FileText, Database, ShieldCheck, Tag } from 'lucide-react';

export function EvidenceDrawer() {
  const { selectedEvidence, isOpen, loading, closeEvidence } = useEvidence();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-base leading-tight">Evidence Provenance</h3>
                <p className="text-xs text-slate-400">Traceable source record verification</p>
              </div>
            </div>
            <button
              onClick={closeEvidence}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                Loading provenance record...
              </div>
            ) : selectedEvidence ? (
              <>
                {/* Confidence & Source ID */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Level</span>
                    <ConfidenceBadge confidence={selectedEvidence.confidence || 'Verified'} />
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Source Identifier</span>
                    <code className="text-xs font-mono font-bold bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-800">
                      {selectedEvidence.source_id || selectedEvidence.id}
                    </code>
                  </div>
                </div>

                {/* Excerpt / Raw Text */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Original Source Excerpt
                  </label>
                  <div className="bg-slate-900 text-emerald-300 font-mono text-xs p-4 rounded-xl shadow-inner whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedEvidence.excerpt || 'No excerpt available for this record.'}
                  </div>
                </div>

                {/* Meta details table */}
                <div className="space-y-3 border-t border-slate-100 pt-4 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Source Type
                    </span>
                    <span className="font-medium text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded">
                      {selectedEvidence.source_type || 'Record'}
                    </span>
                  </div>

                  {selectedEvidence.source_path && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Source Path
                      </span>
                      <span className="font-mono text-[11px] text-slate-700 max-w-[200px] truncate">
                        {selectedEvidence.source_path}
                      </span>
                    </div>
                  )}

                  {selectedEvidence.account_name && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Account</span>
                      <span className="font-medium text-slate-800">{selectedEvidence.account_name}</span>
                    </div>
                  )}

                  {selectedEvidence.deal_title && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Associated Deal</span>
                      <span className="font-medium text-slate-800 truncate max-w-[200px]">
                        {selectedEvidence.deal_title}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" /> Originating Tool
                    </span>
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedEvidence.tool_name || 'MCP Client'}
                    </span>
                  </div>

                  {selectedEvidence.source_date && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Source Date
                      </span>
                      <span className="text-slate-700">{selectedEvidence.source_date}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Retrieved At
                    </span>
                    <span className="text-slate-700">
                      {selectedEvidence.retrieved_at ? new Date(selectedEvidence.retrieved_at).toLocaleString() : 'Live'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] leading-relaxed">
                  <strong>Strict Provenance Principle:</strong> Every number, stakeholder stance, and detected risk in this CRM links back to unmanipulated MCP paperwork or live signal records.
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={closeEvidence}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition shadow"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvidenceDrawer;
