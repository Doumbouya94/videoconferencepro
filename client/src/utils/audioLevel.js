/**
 * Analyses audio level from a MediaStream using Web Audio API.
 * Returns a cleanup function.
 */
export function createAudioAnalyser(stream, onLevel) {
  if (!stream || !stream.getAudioTracks().length) return () => {};

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source   = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  const data = new Uint8Array(analyser.frequencyBinCount);
  let rafId;

  const tick = () => {
    analyser.getByteFrequencyData(data);
    const sum   = data.reduce((a, b) => a + b, 0);
    const level = Math.round(sum / data.length); // 0–255
    onLevel(level);
    rafId = requestAnimationFrame(tick);
  };

  tick();

  return () => {
    cancelAnimationFrame(rafId);
    source.disconnect();
    audioCtx.close();
  };
}
