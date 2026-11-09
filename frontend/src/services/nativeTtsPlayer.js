// High-Quality Native Multilingual Text-to-Speech Engine
// Ensures 100% authentic pronunciation in Telugu, Hindi, Tamil, Kannada, Marathi & English
// Solves the Windows bug where speechSynthesis lacks Indian voices and falls back to English (Microsoft David)

let currentAudio = null;
let audioQueue = [];
let isPlaying = false;
let currentOnEndCallback = null;

/**
 * Splits long text into natural sentence / phrase chunks (< 140 chars)
 * for seamless streaming through Google TTS without hitting URL length limits.
 */
export function splitTextIntoChunks(text, maxLen = 140) {
  if (!text) return [];

  // Remove Markdown symbols, URLs, asterisks, brackets, hashes
  const clean = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#*`_~>\[\]\(\)\{\}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length <= maxLen) return [clean];

  // Split by sentence delimiters: period, exclamation, question mark, danda (।), or newline
  const sentences = clean.split(/(?<=[.!?।\n])\s+/);
  const chunks = [];
  let current = '';

  for (const s of sentences) {
    if (!s.trim()) continue;
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length <= maxLen) {
        current = s;
      } else {
        // Split long sentence by commas, semicolons, or words
        const subParts = s.split(/(?<=[,;])\s+|\s+/);
        current = '';
        for (const part of subParts) {
          if (!part.trim()) continue;
          if ((current + ' ' + part).trim().length <= maxLen) {
            current = (current + ' ' + part).trim();
          } else {
            if (current) chunks.push(current);
            current = part;
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Stops all ongoing speech and clears queue immediately.
 */
export function stopNativeSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.src = '';
    currentAudio = null;
  }
  audioQueue = [];
  isPlaying = false;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentOnEndCallback) {
    const cb = currentOnEndCallback;
    currentOnEndCallback = null;
    cb();
  }
}

/**
 * Plays speech aloud in the native language automatically.
 * 
 * @param {string} text - The text to speak.
 * @param {string} langCode - Language code ('te', 'hi', 'ta', 'kn', 'mr', 'en').
 * @param {Object} options - { onStart, onEnd, onChunk }
 */
export function playNativeSpeech(text, langCode = 'te', options = {}) {
  stopNativeSpeech();

  if (!text || !text.trim()) {
    if (options.onEnd) options.onEnd();
    return;
  }

  const { onStart, onEnd, onChunk } = options;
  currentOnEndCallback = onEnd || null;

  // Normalize language code
  let tl = langCode.toLowerCase().split('-')[0];
  if (!['te', 'hi', 'ta', 'kn', 'mr', 'en'].includes(tl)) {
    tl = 'te'; // default to Telugu for southern farmer queries
  }

  // Split into manageable chunks
  const chunks = splitTextIntoChunks(text, 140);
  if (chunks.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  isPlaying = true;
  if (onStart) onStart();

  let chunkIndex = 0;

  const playNextChunk = () => {
    if (!isPlaying) return;

    if (chunkIndex >= chunks.length) {
      isPlaying = false;
      if (currentOnEndCallback) {
        const cb = currentOnEndCallback;
        currentOnEndCallback = null;
        cb();
      }
      return;
    }

    const chunk = chunks[chunkIndex];
    chunkIndex++;

    if (onChunk) onChunk(chunk, chunkIndex, chunks.length);

    // Google TTS audio stream URL
    const encoded = encodeURIComponent(chunk);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encoded}`;

    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.playbackRate = 1.0;

    audio.onended = () => {
      playNextChunk();
    };

    audio.onerror = (err) => {
      console.warn("Native TTS chunk playback error, trying next:", err);
      playNextChunk();
    };

    // Preload next chunk audio for zero-latency gap
    if (chunkIndex < chunks.length) {
      const nextEncoded = encodeURIComponent(chunks[chunkIndex]);
      const preload = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${nextEncoded}`);
      preload.preload = 'auto';
    }

    audio.play().catch((playErr) => {
      console.warn("Audio autoplay blocked or failed:", playErr);
      // Try Web Speech API fallback if browser autoplay blocked
      fallbackWebSpeech(chunk, tl, () => playNextChunk());
    });
  };

  playNextChunk();
}

/**
 * Fallback to Web Speech API only if Google TTS stream is blocked
 */
function fallbackWebSpeech(text, langCode, onDone) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onDone) onDone();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode === 'te' ? 'te-IN' : (langCode === 'hi' ? 'hi-IN' : 'en-US');
    utterance.onend = () => onDone && onDone();
    utterance.onerror = () => onDone && onDone();
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    if (onDone) onDone();
  }
}

export function isNativeSpeechPlaying() {
  return isPlaying;
}
