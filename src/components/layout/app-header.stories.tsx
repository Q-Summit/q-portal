/**
 * Stories for the AppHeader component.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AppHeader } from "./app-header";

const meta = {
  title: "Layout/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Header with logged in user (with avatar).
 */
export const WithUser: Story = {
  args: {
    user: {
      name: "Max Mustermann",
      image: "https://i.pravatar.cc/32?u=max",
    },
  },
};

/**
 * Header with user but no avatar.
 */
export const WithUserNoAvatar: Story = {
  args: {
    user: {
      name: "Max Mustermann",
      image: null,
    },
  },
};

/**
 * Header without user (logged out state).
 */
export const NoUser: Story = {
  args: {
    user: undefined,
  },
};
