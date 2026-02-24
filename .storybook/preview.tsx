import React, { type ComponentType } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from "msw-storybook-addon";

import { TRPCReactProviderStorybook } from "../src/trpc/msw";
import "../src/styles/globals.css";

initialize({ quiet: true });

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
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
