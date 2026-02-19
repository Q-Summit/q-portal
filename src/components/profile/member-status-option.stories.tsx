import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { MemberStatusOption } from "./member-status-option";
import { RadioGroup } from "@/components/ui/radio-group";
import type { Status } from "@/domain/qsum/profile";

const meta = {
  title: "Profile/MemberStatusOption",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function StatusOptions({ defaultValue }: { defaultValue: Status }) {
  const [value, setValue] = useState<Status>(defaultValue);

  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => setValue(v as Status)}
      className="grid w-full max-w-[400px] grid-cols-2 gap-3"
    >
      <MemberStatusOption
        value="active"
        title="Active Member"
        subtitle="Current team"
        selected={value === "active"}
      />
      <MemberStatusOption
        value="alumni"
        title="Alumni"
        subtitle="Former team"
        selected={value === "alumni"}
      />
    </RadioGroup>
  );
}

export const ActiveSelected: Story = {
  render: () => <StatusOptions defaultValue="active" />,
};

export const AlumniSelected: Story = {
  render: () => <StatusOptions defaultValue="alumni" />,
};

export const Interactive: Story = {
  render: () => <StatusOptions defaultValue="active" />,
};
