import { useUI } from '../context/UIContext.jsx';

export function useActiveSpeaker() {
  const { activeSpeakerId } = useUI();
  return activeSpeakerId;
}
