import { useState, useCallback } from "react";

export function useModalState() {
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);

  const openPhaseModal = useCallback(() => {
    setIsPhaseModalOpen(true);
  }, []);

  const closePhaseModal = useCallback(() => {
    setIsPhaseModalOpen(false);
  }, []);

  const openSpeakerModal = useCallback(() => {
    setIsSpeakerModalOpen(true);
  }, []);

  const closeSpeakerModal = useCallback(() => {
    setIsSpeakerModalOpen(false);
  }, []);

  const togglePhaseModal = useCallback(() => {
    setIsPhaseModalOpen((prev) => !prev);
  }, []);

  const toggleSpeakerModal = useCallback(() => {
    setIsSpeakerModalOpen((prev) => !prev);
  }, []);

  return {
    isPhaseModalOpen,
    isSpeakerModalOpen,
    openPhaseModal,
    closePhaseModal,
    openSpeakerModal,
    closeSpeakerModal,
    togglePhaseModal,
    toggleSpeakerModal,
  };
}