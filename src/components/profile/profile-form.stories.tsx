/**
 * Stories for the ProfileForm component.
 *
 * Uses MSW to mock tRPC endpoints so the component renders with realistic data.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { trpcMutation, trpcQuery } from "../../../.storybook/utils/trpc-helpers";
import { ProfileForm } from "./profile-form";

const meta = {
  title: "Profile/ProfileForm",
  component: ProfileForm,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for profile queries
const mockUser = {
  name: "Max Mustermann",
  image: "https://i.pravatar.cc/96?u=max",
  isHeadOf: false,
};

const mockProfile = {
  userId: "user-1",
  status: "active" as const,
  division: "operations",
  team: "concept", // Valid team for operations division
  lastActiveYear: null,
  teamOther: null,
  phoneNumber: "+49 170 1234567",
  privateEmail: "max@example.com",
  linkedInUrl: "https://linkedin.com/in/maxmustermann",
  isProfileComplete: true,
  talentIds: ["driver_18plus", "gastro"],
};

const mockTalents = [
  { id: "driver_18plus", category: "driver_license", key: "driver_18plus" },
  { id: "driver_21plus", category: "driver_license", key: "driver_21plus" },
  { id: "driver_c1", category: "driver_license", key: "driver_c1" },
  { id: "gastro", category: "gastronomy", key: "gastro" },
];

/**
 * Default view mode with existing profile data.
 * Click "Edit Profile" to enter edit mode.
 */
export const ViewMode: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcMutation("profile", "update", () => ({ ok: true })),
      ],
    },
  },
};

/**
 * Empty profile state (new user).
 */
export const NewProfile: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: { name: "New User", image: null },
          profile: null,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcMutation("profile", "update", () => ({ ok: true })),
      ],
    },
  },
};

/**
 * Alumni member with last active year.
 */
export const AlumniProfile: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: { name: "Former Member", image: "https://i.pravatar.cc/96?u=alumni" },
          profile: {
            ...mockProfile,
            status: "alumni",
            lastActiveYear: 2023,
            talentIds: [],
          },
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcMutation("profile", "update", () => ({ ok: true })),
      ],
    },
  },
};

/**
 * Loading state.
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", async () => {
          // Simulate slow network
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return { user: mockUser, profile: mockProfile };
        }),
        trpcQuery("profile", "listTalents", () => mockTalents),
      ],
    },
  },
};
