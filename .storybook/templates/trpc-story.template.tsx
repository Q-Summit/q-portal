/**
 * Template for creating Storybook stories for components that use tRPC.
 *
 * Copy this file and replace:
 * - ComponentName with your actual component name
 * - routerName with your tRPC router name (e.g. 'profile')
 * - procedureName with your tRPC procedure name (e.g. 'getMy')
 * - defaultMockData with your default mock data (must match procedure output type)
 *
 * For visual regression (Chromatic): use fixed dates and deterministic data,
 * e.g. new Date('2026-01-25T14:30:00Z') instead of new Date().
 */

import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { delay } from "msw";

import { trpcQuery, trpcQueryError } from "../utils/trpc-helpers";

const ComponentName: ComponentType<unknown> = () => null;

const defaultMockData = {
  greeting: "Hello from story!",
};

const meta = {
  title: "Category/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "padded",
    tags: ["autodocs"],
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [trpcQuery("profile", "getMy", () => defaultMockData)],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", async () => {
          await delay("infinite");
          return defaultMockData;
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [trpcQueryError("profile", "getMy", "Failed to fetch data")],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [trpcQuery("profile", "getMy", () => ({ greeting: "" }))],
    },
  },
};
