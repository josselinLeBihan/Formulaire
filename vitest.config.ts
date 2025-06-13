import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";
import { fileURLToPath } from "url";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      root: fileURLToPath(new URL("./", import.meta.url)), // Définit la racine
      globals: true, // Active les globals comme `describe`, `it`, etc.
      environment: "jsdom", // Simule un navigateur pour React
      coverage: {
        provider: "v8", // Utilisation du moteur V8 pour la couverture
        reportsDirectory: "./coverage", // Dossier où seront stockés les rapports
        enabled: true, // Active la couverture
        include: ["src/**/*.tsx", "src/**/*.ts"], // Cible les fichiers TypeScript et React
        exclude: ["node_modules", "dist", "test"], // Ignore ces fichiers
        all: true, // Vérifie même les fichiers non testés
        reporter: ["text", "html"], // Rapports détaillés
      },
    },
  })
);
