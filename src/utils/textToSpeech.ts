const API_KEY = "AIzaSyDNvDAXpjcGmdM4i7I0_FKFLWkK61SkI0o";

export const playInstructionVoice = async (text: string) => {
  if (!text || !API_KEY) {
    if (!API_KEY) console.warn("No TTS API Key found in .env");
    return;
  }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          // "en-GB-Wavenet-C" is a nice, natural sounding British male voice.
          // You can try "en-GB-Wavenet-A" for female.
          voice: { languageCode: "en-GB", name: "en-GB-Wavenet-C" },
          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
        console.error("TTS Error:", data.error.message);
        return;
    }

    if (data.audioContent) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play().catch(e => console.log("Audio play failed (user interaction needed first):", e));
    }
  } catch (error) {
    console.error("Failed to play audio:", error);
  }
};