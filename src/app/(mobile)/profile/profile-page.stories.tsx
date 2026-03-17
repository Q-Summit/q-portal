/**
 * Stories for the Profile page layout.
 *
 * Shows the full mobile app shell with profile form.
 */

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { ProfileForm } from "@/components/profile/profile-form";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { trpcMutation, trpcQuery } from "../../../../.storybook/utils/trpc-helpers";

const meta = {
  title: "Pages/Profile",
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/profile",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockUser = {
  name: "Max Mustermann",
  image: "https://i.pravatar.cc/96?u=profile",
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

function ProfilePageLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader user={mockUser} />
      <main className="flex-1 pb-20">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <ProfileForm />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

/**
 * Profile page with existing data.
 */
export const WithProfile: Story = {
  render: () => <ProfilePageLayout />,
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
 * Profile page for new user.
 */
export const NewUser: Story = {
  render: () => <ProfilePageLayout />,
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
