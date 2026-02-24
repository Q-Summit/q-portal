import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BrandCard } from "./brand-card";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Auth/BrandCard",
  component: BrandCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BrandCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="mb-2 text-lg font-semibold">Card Title</h3>
        <p className="text-muted-foreground">Card content goes here</p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Sign In</h3>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full rounded-md border px-3 py-2" />
          <Button className="w-full">Continue</Button>
        </div>
      </div>
    ),
  },
};

export const Compact: Story = {
  args: {
    className: "w-[300px]",
    children: (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Compact card</p>
      </div>
    ),
  },
};
