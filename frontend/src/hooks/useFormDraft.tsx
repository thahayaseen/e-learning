"use client";

import { useState, useEffect } from "react";

type DraftOptions = {
  draftKey: string;
  expiryDays?: number;
  onLoad?: (data: any) => void;
};

export function useFormDraft<T>({
  draftKey,
  expiryDays = 7,
  onLoad,
}: DraftOptions) {
   const [draftData, setDraftData] = useState<T | null>(null);
  const [draftTimestamp, setDraftTimestamp] = useState<number | null>(null);
  const [draftId, setDraftId] = useState<string>("");
  const [hasDraft, setHasDraft] = useState(false);

  // Load draft on initial mount
  useEffect(() => {
     loadDraft();
  }, [draftKey]);

  // Save draft to localStorage
  const saveDraft = (data: T) => {
    try {
      // Create a unique ID for this draft if it doesn't exist
      const currentDraftId =
        draftId ||
        `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const draftToSave = {
        data,
        timestamp: Date.now(),
        id: currentDraftId,
      };

      localStorage.setItem(draftKey, JSON.stringify(draftToSave));
      setDraftData(data);
      setDraftTimestamp(draftToSave.timestamp);
      setDraftId(currentDraftId);
      // setHasDraft(true)

      return true;
    } catch (error) {
 
      return false;
    }
  };

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(draftKey);

      if (!savedDraft) {
        setHasDraft(false);
        return null;
      }

      const parsedDraft = JSON.parse(savedDraft);

      // Check if draft has expired
      if (parsedDraft.timestamp) {
        const expiryTime = expiryDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        const isExpired = Date.now() - parsedDraft.timestamp > expiryTime;

        if (isExpired) {
          clearDraft();
          return null;
        }

        setDraftTimestamp(parsedDraft.timestamp);
      }
      if (parsedDraft.id) {
        setDraftId(parsedDraft.id);
      }

      setDraftData(parsedDraft.data);
      setHasDraft(true);

      // Call onLoad callback if provided
      if (onLoad) {
        onLoad(parsedDraft.data);
      }

      return parsedDraft.data;
    } catch (error) {
 
      return null;
    }
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
       localStorage.removeItem(draftKey);
      setDraftData(null);
      setDraftTimestamp(null);
      setDraftId("");
      setHasDraft(false);
      return true;
    } catch (error) {
 
      return false;
    }
  };

  // Get formatted timestamp for display
  const getFormattedTimestamp = () => {
    if (!draftTimestamp) return null;

    const date = new Date(draftTimestamp);
    return date.toLocaleString();
  };

  return {
    draftData,
    hasDraft,
    draftTimestamp,
    formattedTimestamp: getFormattedTimestamp(),
    saveDraft,
    loadDraft,
    clearDraft,
  };
}
