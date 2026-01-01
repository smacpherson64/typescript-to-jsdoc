import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/typescript-to-jsdoc",
  server: {
    port: 8001,
    host: true,
  },
});
