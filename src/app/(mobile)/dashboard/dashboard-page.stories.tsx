/**
 * Stories for the Dashboard page layout.
 *
 * Shows the full mobile app shell with dashboard content.
 */

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Pages/Dashboard",
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function DashboardLayout({ userName }: { userName: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        user={{
          name: userName,
          image: "https://i.pravatar.cc/32?u=dashboard",
        }}
      />
      <main className="flex-1 pb-20">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back, {userName}!</p>
          {/* TODO: Dashboard content placeholder */}
          <div className="mt-6 grid gap-4">
            <div className="h-32 rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground">Upcoming Shifts</div>
              <div className="mt-2 text-lg font-semibold text-foreground">3 this week</div>
            </div>
            <div className="h-32 rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground">Team Updates</div>
              <div className="mt-2 text-lg font-semibold text-foreground">No new updates</div>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

/**
 * Default dashboard view.
 */
export const Default: Story = {
  render: () => <DashboardLayout userName="Max Mustermann" />,
};

/**
 * Dashboard for a different user.
 */
export const DifferentUser: Story = {
  render: () => <DashboardLayout userName="Anna Schmidt" />,
};
