/**
 * Stories for the Shifts page.
 *
 * Uses MSW to mock tRPC endpoints so the component renders with realistic data.
 * Demonstrates different user states and view modes.
 */

import { ShiftManager } from "@/components/shifts/shift-manager";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { trpcQuery, trpcQueryError } from "../../../../.storybook/utils/trpc-helpers";

const meta = {
  title: "Pages/Shifts",
  component: ShiftManager,
  parameters: {
    layout: "fullscreen",
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
  isHeadOf: false,
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
 * Stories
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Regular user viewing the shifts list.
 * No "Create" button visible since they're not a planner.
 */
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

/**
 * Planner user (chair division) viewing the shifts list.
 * "Create" button is visible in the header.
 */
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
      ],
    },
  },
};

/**
 * Empty state - no shifts available.
 */
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

/**
 * Loading state - while fetching data.
 */
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
      ],
    },
  },
};

/**
 * Error state - when API call fails.
 */
export const ListViewError: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQueryError("shift", "list", "Failed to load shifts"),
      ],
    },
  },
};

/**
 * Calendar view - showing shifts by time slots.
 */
export const CalendarView: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "calendar", () => mockCalendarSlots),
      ],
    },
  },
};

/**
 * Calendar view - planner user with create button.
 */
export const CalendarViewPlanner: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockPlannerProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "calendar", () => mockCalendarSlots),
      ],
    },
  },
};

/**
 * Calendar view - empty day.
 */
export const CalendarViewEmpty: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcQuery("profile", "getMy", () => ({
          user: mockUser,
          profile: mockRegularProfile,
        })),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcQuery("shift", "calendar", () => []),
      ],
    },
  },
};
