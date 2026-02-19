import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MemberStatusOption } from "./member-status-option";
import { RadioGroup } from "@/components/ui/radio-group";

const meta = {
  title: "Profile/MemberStatusOption",
  component: MemberStatusOption,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "select",
      options: ["active", "alumni"],
    },
    title: {
      control: "text",
    },
    subtitle: {
      control: "text",
    },
    selected: {
      control: "boolean",
    },
  },
  decorators: [
    (Story) => (
      <RadioGroup className="grid grid-cols-2 gap-4">
        <Story />
      </RadioGroup>
    ),
  ],
} satisfies Meta<typeof MemberStatusOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveUnselected: Story = {
  args: {
    value: "active",
    title: "Active Member",
    subtitle: "Current team",
    selected: false,
  },
};

export const ActiveSelected: Story = {
  args: {
    value: "active",
    title: "Active Member",
    subtitle: "Current team",
    selected: true,
  },
};

export const AlumniUnselected: Story = {
  args: {
    value: "alumni",
    title: "Alumni",
    subtitle: "Former team",
    selected: false,
  },
};

export const AlumniSelected: Story = {
  args: {
    value: "alumni",
    title: "Alumni",
    subtitle: "Former team",
    selected: true,
  },
};

export const BothOptions: Story = {
  decorators: [
    () => (
      <RadioGroup className="grid w-[400px] grid-cols-2 gap-4">
        <MemberStatusOption
          value="active"
          title="Active Member"
          subtitle="Current team"
          selected={true}
        />
        <MemberStatusOption value="alumni" title="Alumni" subtitle="Former team" selected={false} />
      </RadioGroup>
    ),
  ],
  args: {
    value: "active",
    title: "Active Member",
    subtitle: "Current team",
    selected: true,
  },
};

export const AlumniSelectedView: Story = {
  decorators: [
    () => (
      <RadioGroup className="grid w-[400px] grid-cols-2 gap-4">
        <MemberStatusOption
          value="active"
          title="Active Member"
          subtitle="Current team"
          selected={false}
        />
        <MemberStatusOption value="alumni" title="Alumni" subtitle="Former team" selected={true} />
      </RadioGroup>
    ),
  ],
  args: {
    value: "alumni",
    title: "Alumni",
    subtitle: "Former team",
    selected: true,
  },
};
