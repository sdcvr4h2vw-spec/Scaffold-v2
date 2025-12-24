import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // 1. LOAD VARIABLES
  // This grabs variables from .env (locally) OR the System (Cloudflare)
  const env = loadEnv(mode, process.cwd(), '');

  // 2. DEBUG LOGGING (Visible in Cloudflare Build Logs)
  console.log("------------------------------------------------");
  console.log("BUILD DEBUG: VITE CONFIG LOADED");
  console.log("Current Mode:", mode);
  console.log("Google Key Present?", env.VITE_GOOGLE_API_KEY ? "YES" : "NO");
  if (env.VITE_GOOGLE_API_KEY) {
      // Print first 5 chars to prove it loaded without leaking the whole key
      console.log("Key value check:", env.VITE_GOOGLE_API_KEY.substring(0, 5) + "...");
  } else {
      console.log("CRITICAL: Google Key is MISSING in this environment!");
  }
  console.log("------------------------------------------------");

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [
      react(),
      tailwindcss(),
    ],

    define: {
      // 3. FORCE REPLACEMENT
      // This tells Vite: "Find every mention of import.meta.env.VITE_GOOGLE_API_KEY 
      // and replace it with the actual text string of the key."
      
      // We use || "" to prevent local crashes if the key is missing
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY || ""),
      
      // Keep your Gemini keys
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});