/**
 * Stories for the AppFooter navigation component.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppFooter } from "./app-footer";

const meta = {
  title: "Layout/AppFooter",
  component: AppFooter,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative h-screen bg-slate-50">
        <div className="h-full" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Footer with Dashboard active.
 */
export const DashboardActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
};

/**
 * Footer with Shifts active.
 */
export const ShiftsActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/shifts",
      },
    },
  },
};

/**
 * Footer with Profile active.
 */
export const ProfileActive: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/profile",
      },
    },
  },
};
