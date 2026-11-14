import React, { useState } from 'react';
import { X, Building2, User, DollarSign, Briefcase, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AddAccountModal({ isOpen, onClose, onAccountCreated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    industry: 'Energy & Critical Infrastructure',
    description: '',
    initialValue: '',
    currency: 'GBP',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    contactStance: 'champion'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Account name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        id: formData.id.trim() || undefined,
        industry: formData.industry,
        description: formData.description.trim(),
        initialValue: formData.initialValue ? parseFloat(formData.initialValue) : 0,
        currency: formData.currency,
        primaryContact: formData.contactName.trim() ? {
          name: formData.contactName.trim(),
          role: formData.contactRole.trim(),
          email: formData.contactEmail.trim(),
          phone: formData.contactPhone.trim(),
          stance: formData.contactStance
        } : undefined
      };

      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to create account' }));
        throw new Error(errData.error || 'Server error creating account');
      }

      const created = await res.json();
      if (onAccountCreated) onAccountCreated(created);
      onClose();
      navigate(`/accounts/${created.accountId || created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Add New Account</h2>
              <p className="text-[11px] text-zinc-500">Initialize an enterprise customer account & pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Profile */}
          <div className="space-y-3">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Account Overview
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Account Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Northumbria Water Authority"
                  required
                  className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Account ID / Code</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="e.g. NWA (Optional)"
                  className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium text-[11px]">Industry Sector</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
              >
                <option value="Energy & Critical Infrastructure">Energy & Critical Infrastructure</option>
                <option value="Public Safety & Emergency Services">Public Safety & Emergency Services</option>
                <option value="Industrial & Manufacturing Security">Industrial & Manufacturing Security</option>
                <option value="Maritime & Port Operations">Maritime & Port Operations</option>
                <option value="Transportation & Rail Infrastructure">Transportation & Rail Infrastructure</option>
                <option value="Enterprise Facilities & Real Estate">Enterprise Facilities & Real Estate</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium text-[11px]">Account Overview & Operational Mandate</label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe fleet dock locations, statutory mission goals, and operational setup..."
                className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
              />
            </div>
          </div>

          {/* Commercial Contract */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/60">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Initial Commercial Opportunity
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Initial Contract / Pipeline Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 font-mono">£</span>
                  <input
                    type="number"
                    name="initialValue"
                    value={formData.initialValue}
                    onChange={handleChange}
                    placeholder="250000"
                    className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg pl-7 pr-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs font-mono"
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Primary Stakeholder */}
          <div className="space-y-3 pt-3 border-t border-zinc-800/60">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Primary Stakeholder / Sponsor
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Contact Full Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Alistair Vance"
                  className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Role / Job Title</label>
                <input
                  type="text"
                  name="contactRole"
                  value={formData.contactRole}
                  onChange={handleChange}
                  placeholder="e.g. Head of Transmission Operations"
                  className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Email Address</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="alistair.vance@powergrid.co.uk"
                  className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium text-[11px]">Initial Relationship Stance</label>
                <select
                  name="contactStance"
                  value={formData.contactStance}
                  onChange={handleChange}
                  className="w-full bg-zinc-950/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-xs"
                >
                  <option value="champion">Internal Champion / Supportive</option>
                  <option value="neutral">Neutral / Bureaucratic</option>
                  <option value="guarded">Guarded / Compliance Scrutiny</option>
                  <option value="resistant">Resistant / Sceptic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Onboarding Account...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Onboard Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAccountModal;
