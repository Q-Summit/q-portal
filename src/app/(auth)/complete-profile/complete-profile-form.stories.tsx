import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { delay } from "msw";
import React from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { trpcQuery, trpcMutation } from "../../../../.storybook/utils/trpc-helpers";
import CompleteProfileForm from "./complete-profile-form";

const profileMockData = {
  id: "user-123",
  userId: "user-123",
  status: "active",
  lastActiveYear: null,
  division: null,
  team: null,
  teamOther: null,
  isProfileComplete: false,
};

const profileWithExistingData = {
  ...profileMockData,
  status: "alumni",
  division: "operations",
  team: "concept",
  lastActiveYear: 2024,
};

const meta = {
  title: "Auth/Complete Profile Form",
  component: CompleteProfileForm,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CompleteProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const withAuthShell = (Story: React.ComponentType) => (
  <AuthShell>
    <Story />
  </AuthShell>
);

export const Default: Story = {
  decorators: [withAuthShell],
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => profileMockData),
        trpcMutation("profile", "complete", () => ({ ok: true })),
      ],
    },
  },
};

export const WithExistingData: Story = {
  decorators: [withAuthShell],
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => profileWithExistingData),
        trpcMutation("profile", "complete", () => ({ ok: true })),
      ],
    },
  },
};

export const Loading: Story = {
  decorators: [withAuthShell],
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", async () => {
          await delay("infinite");
          return profileMockData;
        }),
      ],
    },
  },
};

export const Submitting: Story = {
  decorators: [withAuthShell],
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => profileMockData),
        trpcMutation("profile", "complete", async () => {
          await delay("infinite");
          return { ok: true };
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  decorators: [withAuthShell],
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => profileMockData),
        trpcMutation("profile", "complete", () => {
          throw new Error("Failed to save profile. Please try again.");
        }),
      ],
    },
  },
};

export const AlumniFlow: Story = {
  decorators: [withAuthShell],
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          ...profileMockData,
          status: "alumni",
        })),
        trpcMutation("profile", "complete", () => ({ ok: true })),
      ],
    },
  },
};
