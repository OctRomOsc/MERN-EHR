import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from the .env file located at the root
  const env = loadEnv(mode, '../', '');

  return {
      plugins: [
          react(),
      ],
      define: {
          // Make the environment variables available to the application
          'process.env': env,
      },
  }
});
