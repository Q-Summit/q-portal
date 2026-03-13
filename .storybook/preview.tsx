import type { Preview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from "msw-storybook-addon";
import { type ComponentType } from "react";

import { INITIAL_VIEWPORTS } from "storybook/viewport";
import "../src/styles/globals.css";
import { TRPCReactProviderStorybook } from "../src/trpc/msw";

initialize({ quiet: true });

const preview: Preview = {
  initialGlobals: {
    viewport: { value: "iphone13pro", isRotated: false },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
    },

    msw: {
      handlers: [],
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "error",
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story: ComponentType) => (
      <TRPCReactProviderStorybook>
        <Story />
      </TRPCReactProviderStorybook>
    ),
  ],
};

export default preview;
