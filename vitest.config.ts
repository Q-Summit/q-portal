import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const port = process.env.STORYBOOK_PORT
  ? parseInt(process.env.STORYBOOK_PORT, 10)
  : 6006;

export default defineConfig({
  server: {
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.next/**",
        "**/storybook-static/**",
        "**/.git/**",
      ],
    },
  },
  test: {
    coverage: {
      provider: "istanbul",
    },
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: ".storybook",
            storybookUrl: `http://127.0.0.1:${port}`,
            storybookScript: "bun run storybook --no-open",
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
