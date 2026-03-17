/**
 * Stories for the ShiftList component.
 *
 * Uses MSW to mock tRPC endpoints so the component renders with realistic data.
 * Demonstrates empty state, loading state, populated state, and inline editing.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { trpcQuery } from "../../../.storybook/utils/trpc-helpers";
import { ShiftList } from "./shift-list";

const meta = {
  title: "Shifts/ShiftList",
  component: ShiftList,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ShiftList>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ──────────────────────────────────────────────────────────────────────────
 * Mock Data
 * ────────────────────────────────────────────────────────────────────────── */

const mockTalents = [
  { id: "driver_18plus", category: "driver_license", key: "driver_18plus" },
  { id: "driver_21plus", category: "driver_license", key: "driver_21plus" },
  { id: "gastro", category: "gastronomy", key: "gastro" },
  { id: "first_aid", category: "medical", key: "first_aid" },
  { id: "security", category: "operations", key: "security" },
];

const mockUser = {
  id: "user-1",
  name: "Max Mustermann",
  email: "max@example.com",
  image: "https://i.pravatar.cc/150?u=shift-list",
};

const mockPlannerProfile = {
  id: "profile-1",
  userId: "user-1",
  status: "active" as const,
  division: "chair" as const,
  team: "board" as const,
  lastActiveYear: 2025,
  teamOther: null,
  phoneNumber: null,
  privateEmail: null,
  linkedInUrl: null,
  talentIds: ["driver_18plus", "driver_21plus"],
};

const mockShifts = [
  {
    id: "shift-1",
    location: "Munich Central Station",
    task: "Registration Desk",
    description: "Handle participant check-ins and distribute badges",
    notionLink: "https://notion.so/shift-1",
    startTime: new Date("2026-04-09T08:00:00"),
    endTime: new Date("2026-04-09T12:00:00"),
    createdBy: "user-1",
    createdAt: new Date("2026-03-01T10:00:00"),
    slotSummary: {
      totalHeadcount: 4,
    },
  },
  {
    id: "shift-2",
    location: "Conference Hall A",
    task: "Stage Setup",
    description: "Assist with audio/visual equipment setup",
    notionLink: null,
    startTime: new Date("2026-04-09T06:00:00"),
    endTime: new Date("2026-04-09T09:00:00"),
    createdBy: "user-1",
    createdAt: new Date("2026-03-01T11:00:00"),
    slotSummary: {
      totalHeadcount: 2,
    },
  },
  {
    id: "shift-3",
    location: "Catering Area",
    task: "Food Service",
    description: "Serve meals and manage dietary requirements",
    notionLink: "https://notion.so/shift-3",
    startTime: new Date("2026-04-09T12:00:00"),
    endTime: new Date("2026-04-09T15:00:00"),
    createdBy: "user-2",
    createdAt: new Date("2026-03-02T09:00:00"),
    slotSummary: {
      totalHeadcount: 6,
    },
  },
  {
    id: "shift-4",
    location: "Parking Lot",
    task: "Traffic Direction",
    description: "Guide vehicles and manage parking flow",
    notionLink: null,
    startTime: new Date("2026-04-10T07:00:00"),
    endTime: new Date("2026-04-10T19:00:00"),
    createdBy: "user-1",
    createdAt: new Date("2026-03-03T14:00:00"),
    slotSummary: {
      totalHeadcount: 3,
    },
  },
];

function createBaseHandlers() {
  return [
    trpcQuery("profile", "getMy", () => ({
      user: mockUser,
      profile: mockPlannerProfile,
    })),
    trpcQuery("shift", "list", () => ({
      items: mockShifts,
      total: mockShifts.length,
      nextCursor: null,
    })),
    trpcQuery("shift", "calendar", () => []),
  ];
}

/* ──────────────────────────────────────────────────────────────────────────
 * Stories
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Empty state - no shifts available.
 */
export const Empty: Story = {
  args: {
    shifts: [],
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};

/**
 * Loading state - shows skeleton placeholders.
 */
export const Loading: Story = {
  args: {
    shifts: [],
    isLoading: true,
  },
  parameters: {
    msw: {
      handlers: [
        ...createBaseHandlers(),
        trpcQuery("profile", "listTalents", async () => {
          // Simulate slow network for talents
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return mockTalents;
        }),
      ],
    },
  },
};

/**
 * Populated state - multiple shifts with different data.
 */
export const Populated: Story = {
  args: {
    shifts: mockShifts,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};

/**
 * Single shift - minimal data.
 */
export const SingleShift: Story = {
  args: {
    shifts: [mockShifts[0]],
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};

/**
 * Many shifts - demonstrates scrolling behavior.
 */
export const ManyShifts: Story = {
  args: {
    shifts: Array.from({ length: 15 }, (_, i) => ({
      ...mockShifts[i % mockShifts.length],
      id: `shift-${i + 1}`,
      location: `${mockShifts[i % mockShifts.length].location} ${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000),
    })),
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};

/**
 * Inline editing - demonstrates the edit mode for the first shift.
 * This story shows the inline editing interface with input fields.
 */
export const InlineEditing: Story = {
  args: {
    shifts: mockShifts,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for the component to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Find and click the edit button on the first row
    const editButton =
      canvasElement.querySelector('[data-testid="edit-shift-1"]') ??
      canvasElement.querySelector('button[title="Edit"]');

    if (editButton) {
      (editButton as HTMLButtonElement).click();
    }
  },
};

/**
 * With callbacks - demonstrates edit and delete handlers.
 */
export const WithCallbacks: Story = {
  args: {
    shifts: mockShifts,
    isLoading: false,
    onEdit: (shift) => {
      console.log("Edit shift:", shift);
    },
    onDelete: (shiftId) => {
      console.log("Delete shift:", shiftId);
    },
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};

/**
 * Long content - demonstrates text wrapping for long locations and tasks.
 */
export const LongContent: Story = {
  args: {
    shifts: [
      {
        ...mockShifts[0],
        location:
          "Munich Central Station - Main Entrance Hall, Left Wing, Near the Information Desk",
        task: "Registration Desk - Handle participant check-ins, distribute badges, manage VIP list, and coordinate with security team for access control",
      },
    ],
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};

/**
 * Zero headcount - shows shift with no assigned staff.
 */
export const ZeroHeadcount: Story = {
  args: {
    shifts: [
      {
        ...mockShifts[0],
        slotSummary: {
          totalHeadcount: 0,
        },
      },
    ],
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};

/**
 * Multi-day shift - demonstrates time formatting across days.
 */
export const MultiDayShift: Story = {
  args: {
    shifts: [
      {
        ...mockShifts[3],
        startTime: new Date("2026-04-09T22:00:00"),
        endTime: new Date("2026-04-10T06:00:00"),
      },
    ],
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: [...createBaseHandlers(), trpcQuery("profile", "listTalents", () => mockTalents)],
    },
  },
};
