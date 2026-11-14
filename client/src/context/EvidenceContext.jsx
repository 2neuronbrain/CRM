import React, { createContext, useContext, useState } from 'react';

const EvidenceContext = createContext(null);

export function EvidenceProvider({ children }) {
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openEvidence = async (evidenceIdOrObj) => {
    if (!evidenceIdOrObj) return;

    if (typeof evidenceIdOrObj === 'object') {
      setSelectedEvidence(evidenceIdOrObj);
      setIsOpen(true);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    try {
      const res = await fetch(`/api/evidence/${evidenceIdOrObj}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedEvidence(data);
      } else {
        setSelectedEvidence({
          id: evidenceIdOrObj,
          excerpt: 'Evidence record details could not be retrieved from repository.',
          source_type: 'unknown',
          confidence: 'Unknown'
        });
      }
    } catch (err) {
      console.error('Failed to load evidence details:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeEvidence = () => {
    setIsOpen(false);
    setSelectedEvidence(null);
  };

  return (
    <EvidenceContext.Provider value={{ selectedEvidence, isOpen, loading, openEvidence, closeEvidence }}>
      {children}
    </EvidenceContext.Provider>
  );
}

export function useEvidence() {
  const context = useContext(EvidenceContext);
  if (!context) {
    throw new Error('useEvidence must be used within an EvidenceProvider');
  }
  return context;
}
