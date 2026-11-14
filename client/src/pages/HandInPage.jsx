import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Globe, Github, FileText, Video, Save, ExternalLink } from 'lucide-react';

export function HandInPage() {
  const [links, setLinks] = useState({
    hosted_url: '',
    github_repo_url: '',
    thinking_doc_url: '',
    walkthrough_video_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/hand-in')
      .then(r => r.json())
      .then(data => {
        if (data) {
          setLinks({
            hosted_url: data.hosted_url || '',
            github_repo_url: data.github_repo_url || '',
            thinking_doc_url: data.thinking_doc_url || '',
            walkthrough_video_url: data.walkthrough_video_url || ''
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/hand-in', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links)
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save hand-in links:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
            Official Submission Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hand In Requirements</h1>
        <p className="text-xs text-slate-500 mt-1">
          The four required submission links for judges. These URLs are stored dynamically and can be updated anytime before deadline.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Hand-in submission links saved successfully to persistent database!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Link 1: Hosted CRM URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              1. Live Hosted CRM URL
            </label>
            <span className="text-[11px] text-slate-400">Works in incognito without laptop</span>
          </div>
          <input
            type="url"
            placeholder="https://crm-demo.up.railway.app (or custom deployment domain)"
            value={links.hosted_url}
            onChange={(e) => setLinks({ ...links, hosted_url: e.target.value })}
            className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
          <p className="text-[11px] text-slate-500">
            Judges open this link to test live answers to the 5 questions and verify real-time MCP signal ingestion.
          </p>
        </div>

        {/* Link 2: Public Git Repository */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-900" />
              2. Public Git Repository URL
            </label>
            <span className="text-[11px] text-slate-400">Public, no credentials in code</span>
          </div>
          <input
            type="url"
            placeholder="https://github.com/username/CRM"
            value={links.github_repo_url}
            onChange={(e) => setLinks({ ...links, github_repo_url: e.target.value })}
            className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
          <p className="text-[11px] text-slate-500">
            Source code repository named <strong>CRM</strong> including setup guide, database migrations, and .env.example.
          </p>
        </div>

        {/* Link 3: Google Docs Thinking Document */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              3. Thinking Document URL (Google Docs)
            </label>
            <span className="text-[11px] text-slate-400">One page architecture document</span>
          </div>
          <input
            type="url"
            placeholder="https://docs.google.com/document/d/..."
            value={links.thinking_doc_url}
            onChange={(e) => setLinks({ ...links, thinking_doc_url: e.target.value })}
            className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
          <p className="text-[11px] text-slate-500">
            Covers: What it does, who it is for, deterministic decision rules, intelligence gaps, and AI usage breakdown.
          </p>
        </div>

        {/* Link 4: Walkthrough Video */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-600" />
              4. Walkthrough Video URL (Google Drive)
            </label>
            <span className="text-[11px] text-slate-400">Three-minute demonstration</span>
          </div>
          <input
            type="url"
            placeholder="https://drive.google.com/file/d/..."
            value={links.walkthrough_video_url}
            onChange={(e) => setLinks({ ...links, walkthrough_video_url: e.target.value })}
            className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
          />
          <p className="text-[11px] text-slate-500">
            Must show: The five answers for one account, one number traced to source evidence, and live signal ingestion.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Submission Links'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default HandInPage;
