import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Globe, Github, FileText, Video, Save, ExternalLink, Loader2 } from 'lucide-react';

export function HandInPage() {
  const [links, setLinks] = useState({
    hosted_url: '',
    github_repo_url: 'https://github.com/2neuronbrain/CRM',
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
            github_repo_url: data.github_repo_url || 'https://github.com/2neuronbrain/CRM',
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
          <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
            Submission Deliverables
          </span>
        </div>
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
          Hand-In Links & Submission Registry
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Four required public submission URLs for project verification.
        </p>
      </div>

      <div className="bg-zinc-800/40 rounded-xl border border-zinc-800/60 p-6 shadow-sm space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Submission links saved and persisted to database.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Link 1: Hosted Application */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-semibold text-zinc-200">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>1. Hosted Application URL</span>
            </label>
            <input
              type="url"
              placeholder="https://crm-flytbase.example.com"
              value={links.hosted_url}
              onChange={(e) => setLinks({ ...links, hosted_url: e.target.value })}
              className="w-full border border-zinc-700/60 rounded-lg p-2.5 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-xs"
            />
          </div>

          {/* Link 2: GitHub Repository */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-semibold text-zinc-200">
              <Github className="w-4 h-4 text-zinc-300" />
              <span>2. GitHub Repository URL</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/2neuronbrain/CRM"
              value={links.github_repo_url}
              onChange={(e) => setLinks({ ...links, github_repo_url: e.target.value })}
              className="w-full border border-zinc-700/60 rounded-lg p-2.5 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-xs"
            />
          </div>

          {/* Link 3: Thinking Document */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-semibold text-zinc-200">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>3. Thinking Process Document URL</span>
            </label>
            <input
              type="url"
              placeholder="https://docs.google.com/... or GitHub markdown link"
              value={links.thinking_doc_url}
              onChange={(e) => setLinks({ ...links, thinking_doc_url: e.target.value })}
              className="w-full border border-zinc-700/60 rounded-lg p-2.5 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-xs"
            />
          </div>

          {/* Link 4: Walkthrough Video */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-semibold text-zinc-200">
              <Video className="w-4 h-4 text-red-400" />
              <span>4. Walkthrough Video URL</span>
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or Loom / Google Drive link"
              value={links.walkthrough_video_url}
              onChange={(e) => setLinks({ ...links, walkthrough_video_url: e.target.value })}
              className="w-full border border-zinc-700/60 rounded-lg p-2.5 bg-zinc-900/60 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2 text-xs"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Hand-In Registry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HandInPage;
