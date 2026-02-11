import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

/**
 * Configuration Vitest pour les tests unitaires.
 * 
 * Pour installer les dépendances :
 * npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
 * 
 * Pour lancer les tests :
 * npx vitest        (mode watch)
 * npx vitest run    (une seule fois)
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"],
      include: ["lib/**", "components/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
