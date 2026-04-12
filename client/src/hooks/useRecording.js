import { useMedia } from '../context/MediaContext.jsx';

export function useRecording() {
  const { isRecording, startRecording, stopRecording } = useMedia();
  return {
    isRecording,
    startRecording,
    stopRecording,
    toggle: isRecording ? stopRecording : startRecording,
  };
}
