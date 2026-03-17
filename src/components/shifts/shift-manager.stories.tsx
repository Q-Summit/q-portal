/**
 * Stories for the ShiftManager component.
 *
 * Uses MSW to mock tRPC endpoints so the component renders with realistic data.
 * Demonstrates loading state, error state, planner vs regular user, list vs calendar view.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { trpcQuery, trpcMutation } from "../../../.storybook/utils/trpc-helpers";
import { ShiftManager } from "./shift-manager";

const meta = {
  title: "Shifts/ShiftManager",
  component: ShiftManager,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ShiftManager>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ──────────────────────────────────────────────────────────────────────────
 * Mock Data
 * ────────────────────────────────────────────────────────────────────────── */

const mockTalents = [
  { id: "talent-1", category: "driver_license", key: "driver_18plus" },
  { id: "talent-2", category: "driver_license", key: "driver_21plus" },
  { id: "talent-3", category: "driver_license", key: "driver_c1" },
  { id: "talent-4", category: "gastronomy", key: "gastro" },
];

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
  talentIds: ["talent-1", "talent-3"],
};

const mockRegularProfile = {
  id: "profile-2",
  userId: "user-2",
  status: "active" as const,
  division: "orga" as const,
  team: "logistics" as const,
  lastActiveYear: 2025,
  teamOther: null,
  phoneNumber: null,
  privateEmail: null,
  linkedInUrl: null,
  talentIds: ["talent-2"],
};

const mockUser = {
  id: "user-1",
  name: "Max Mustermann",
  email: "max@example.com",
  image: "https://i.pravatar.cc/150?u=shift-manager",
};

const april9Date = new Date(2026, 3, 9);

function slotTime(hour: number, minute: number): Date {
  const date = new Date(april9Date);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const mockCalendarSlots = [
  {
    slotTime: slotTime(6, 0),
    totalHeadcount: 2,
    shifts: [
      {
        shiftId: "shift-1",
        location: "Conference Hall A",
        task: "Stage Setup",
        description: "Assist with audio/visual equipment setup",
        notionLink: null,
        startTime: slotTime(6, 0),
        endTime: slotTime(9, 0),
        headcount: 2,
      },
    ],
  },
  {
    slotTime: slotTime(8, 0),
    totalHeadcount: 4,
    shifts: [
      {
        shiftId: "shift-2",
        location: "Munich Central Station",
        task: "Registration Desk",
        description: "Handle participant check-ins",
        notionLink: "https://notion.so/shift-2",
        startTime: slotTime(8, 0),
        endTime: slotTime(12, 0),
        headcount: 4,
      },
    ],
  },
  {
    slotTime: slotTime(12, 0),
    totalHeadcount: 6,
    shifts: [
      {
        shiftId: "shift-3",
        location: "Catering Area",
        task: "Food Service",
        description: "Serve meals",
        notionLink: "https://notion.so/shift-3",
        startTime: slotTime(12, 0),
        endTime: slotTime(15, 0),
        headcount: 6,
      },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────────
 * Stories - Regular User (can view, cannot create)
 * ────────────────────────────────────────────────────────────────────────── */

export const ListViewRegularUser: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
      ],
    },
  },
};

export const ListViewEmpty: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "list", () => ({
          items: [],
          total: 0,
          nextCursor: null,
        })),
      ],
    },
  },
};

export const ListViewLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return {
            user: mockUser,
            profile: mockRegularProfile,
          };
        }),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
      ],
    },
  },
};

export const ListViewError: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("shift", "list", () => {
          throw new Error("Failed to fetch shifts: Database connection timeout");
        }),
      ],
    },
  },
};

export const CalendarViewRegularUser: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "calendar", () => mockCalendarSlots),
      ],
    },
  },
};

export const CalendarViewEmpty: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "calendar", () => []),
      ],
    },
  },
};

export const CalendarViewLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "calendar", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return mockCalendarSlots;
        }),
      ],
    },
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 * Stories - Planner User (can view AND create)
 * ────────────────────────────────────────────────────────────────────────── */

export const ListViewPlanner: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockPlannerProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
        trpcMutation("shift", "create", () => ({ ok: true, id: "new-shift-id" })),
      ],
    },
  },
};

export const CalendarViewPlanner: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockPlannerProfile,
        })),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "calendar", () => mockCalendarSlots),
        trpcMutation("shift", "create", () => ({ ok: true, id: "new-shift-id" })),
      ],
    },
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 * Stories - User Without Profile
 * ────────────────────────────────────────────────────────────────────────── */

export const NoProfile: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: null,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "list", () => ({
          items: mockShifts,
          total: mockShifts.length,
          nextCursor: null,
        })),
      ],
    },
  },
};

/* ──────────────────────────────────────────────────────────────────────────
 * Stories - Many Shifts (scroll testing)
 * ────────────────────────────────────────────────────────────────────────── */

export const ManyShifts: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "list", () => ({
          items: Array.from({ length: 20 }, (_, i) => ({
            ...mockShifts[i % mockShifts.length],
            id: `shift-${i + 1}`,
            location: `${mockShifts[i % mockShifts.length].location} ${i + 1}`,
            startTime: new Date(`2026-04-0${(i % 9) + 1}T08:00:00`),
            endTime: new Date(`2026-04-0${(i % 9) + 1}T12:00:00`),
          })),
          total: 20,
          nextCursor: null,
        })),
      ],
    },
  },
};
