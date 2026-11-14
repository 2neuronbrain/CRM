import React, { useState } from 'react';
import { X, Building2, User, DollarSign, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AddAccountModal({ isOpen, onClose, onAccountCreated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    industry: 'Public Safety & Emergency Services',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add New Account</h2>
              <p className="text-xs text-slate-400">Initialize an enterprise customer account & commercial pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Profile */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Account Overview
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-medium">Account Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Northumbria Water Authority"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Account ID / Code</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="e.g. NWA (Optional)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Industry / Sector</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="Public Safety & Emergency Services">Public Safety & Emergency Services</option>
                  <option value="Critical Infrastructure & Utilities">Critical Infrastructure & Utilities</option>
                  <option value="Industrial Security & Perimeter">Industrial Security & Perimeter</option>
                  <option value="Logistics & Port Operations">Logistics & Port Operations</option>
                  <option value="Energy & Natural Resources">Energy & Natural Resources</option>
                  <option value="Commercial Real Estate">Commercial Real Estate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Contract / Pipeline Value</label>
                <div className="flex gap-2">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-20 bg-slate-950 border border-slate-800 rounded-md px-2 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                  <input
                    type="number"
                    name="initialValue"
                    value={formData.initialValue}
                    onChange={handleChange}
                    placeholder="e.g. 250000"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Account Brief & Deployment Scope</label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Key operational context, proposed dock coverage, or procurement timeline..."
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs resize-none"
              />
            </div>
          </div>

          {/* Primary Stakeholder */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Primary Stakeholder / Power Map Lead
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="e.g. Mark Henders"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Role / Title</label>
                <input
                  type="text"
                  name="contactRole"
                  value={formData.contactRole}
                  onChange={handleChange}
                  placeholder="e.g. Head of Security & Risk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-medium">Email Address</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="e.g. m.henders@authority.gov.uk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Stance / Sentiment</label>
                <select
                  name="contactStance"
                  value={formData.contactStance}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                >
                  <option value="champion">Champion</option>
                  <option value="neutral">Neutral</option>
                  <option value="detractor">Detractor</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-md shadow-md transition flex items-center gap-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
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
