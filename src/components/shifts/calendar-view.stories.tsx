/**
 * Stories for the CalendarView component.
 *
 * Uses MSW to mock tRPC endpoints so the component renders with realistic data.
 * Demonstrates loading state, empty state, populated state with different headcounts,
 * and day navigation.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { trpcQuery } from "../../../.storybook/utils/trpc-helpers";
import { CalendarView } from "./calendar-view";

const meta = {
  title: "Shifts/CalendarView",
  component: CalendarView,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ──────────────────────────────────────────────────────────────────────────
 * Mock Data
 * ────────────────────────────────────────────────────────────────────────── */

const april9Date = new Date(2026, 3, 9);
const april10Date = new Date(2026, 3, 10);

/** Helper to create a slot time on April 9 */
function slotTime(hour: number, minute: number): Date {
  const date = new Date(april9Date);
  date.setHours(hour, minute, 0, 0);
  return date;
}

/** Helper to create a slot time on April 10 */
function slotTimeApril10(hour: number, minute: number): Date {
  const date = new Date(april10Date);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const _mockLocations = [
  "Munich Central Station",
  "Conference Hall A",
  "Catering Area",
  "Parking Lot",
];

const mockCalendarSlotsApril9 = [
  // Morning slots
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
    slotTime: slotTime(6, 30),
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
        description: "Handle participant check-ins and distribute badges",
        notionLink: "https://notion.so/shift-2",
        startTime: slotTime(8, 0),
        endTime: slotTime(12, 0),
        headcount: 4,
      },
    ],
  },
  {
    slotTime: slotTime(8, 30),
    totalHeadcount: 4,
    shifts: [
      {
        shiftId: "shift-2",
        location: "Munich Central Station",
        task: "Registration Desk",
        description: "Handle participant check-ins and distribute badges",
        notionLink: "https://notion.so/shift-2",
        startTime: slotTime(8, 0),
        endTime: slotTime(12, 0),
        headcount: 4,
      },
    ],
  },
  // Midday slots
  {
    slotTime: slotTime(12, 0),
    totalHeadcount: 10,
    shifts: [
      {
        shiftId: "shift-3",
        location: "Catering Area",
        task: "Food Service",
        description: "Serve meals and manage dietary requirements",
        notionLink: "https://notion.so/shift-3",
        startTime: slotTime(12, 0),
        endTime: slotTime(15, 0),
        headcount: 6,
      },
      {
        shiftId: "shift-4",
        location: "Munich Central Station",
        task: "Registration Desk",
        description: "Handle participant check-ins and distribute badges",
        notionLink: "https://notion.so/shift-2",
        startTime: slotTime(8, 0),
        endTime: slotTime(12, 0),
        headcount: 4,
      },
    ],
  },
  {
    slotTime: slotTime(12, 30),
    totalHeadcount: 6,
    shifts: [
      {
        shiftId: "shift-3",
        location: "Catering Area",
        task: "Food Service",
        description: "Serve meals and manage dietary requirements",
        notionLink: "https://notion.so/shift-3",
        startTime: slotTime(12, 0),
        endTime: slotTime(15, 0),
        headcount: 6,
      },
    ],
  },
  // Afternoon slots
  {
    slotTime: slotTime(14, 0),
    totalHeadcount: 8,
    shifts: [
      {
        shiftId: "shift-5",
        location: "Conference Hall A",
        task: "Session Support",
        description: "Assist speakers and manage Q&A sessions",
        notionLink: null,
        startTime: slotTime(14, 0),
        endTime: slotTime(18, 0),
        headcount: 3,
      },
      {
        shiftId: "shift-3",
        location: "Catering Area",
        task: "Food Service",
        description: "Serve meals and manage dietary requirements",
        notionLink: "https://notion.so/shift-3",
        startTime: slotTime(12, 0),
        endTime: slotTime(15, 0),
        headcount: 6,
      },
    ],
  },
  {
    slotTime: slotTime(14, 30),
    totalHeadcount: 9,
    shifts: [
      {
        shiftId: "shift-5",
        location: "Conference Hall A",
        task: "Session Support",
        description: "Assist speakers and manage Q&A sessions",
        notionLink: null,
        startTime: slotTime(14, 0),
        endTime: slotTime(18, 0),
        headcount: 3,
      },
      {
        shiftId: "shift-3",
        location: "Catering Area",
        task: "Food Service",
        description: "Serve meals and manage dietary requirements",
        notionLink: "https://notion.so/shift-3",
        startTime: slotTime(12, 0),
        endTime: slotTime(15, 0),
        headcount: 6,
      },
    ],
  },
  // Evening slots
  {
    slotTime: slotTime(18, 0),
    totalHeadcount: 5,
    shifts: [
      {
        shiftId: "shift-6",
        location: "Parking Lot",
        task: "Traffic Direction",
        description: "Guide vehicles and manage parking flow",
        notionLink: null,
        startTime: slotTime(18, 0),
        endTime: slotTime(22, 0),
        headcount: 5,
      },
    ],
  },
  {
    slotTime: slotTime(18, 30),
    totalHeadcount: 5,
    shifts: [
      {
        shiftId: "shift-6",
        location: "Parking Lot",
        task: "Traffic Direction",
        description: "Guide vehicles and manage parking flow",
        notionLink: null,
        startTime: slotTime(18, 0),
        endTime: slotTime(22, 0),
        headcount: 5,
      },
    ],
  },
  {
    slotTime: slotTime(22, 0),
    totalHeadcount: 3,
    shifts: [
      {
        shiftId: "shift-7",
        location: "Conference Hall A",
        task: "Cleanup",
        description: "Post-event cleanup and equipment storage",
        notionLink: null,
        startTime: slotTime(22, 0),
        endTime: slotTime(23, 0),
        headcount: 3,
      },
    ],
  },
];

const mockCalendarSlotsApril10 = [
  {
    slotTime: slotTimeApril10(7, 0),
    totalHeadcount: 3,
    shifts: [
      {
        shiftId: "shift-8",
        location: "Parking Lot",
        task: "Traffic Direction",
        description: "Guide vehicles and manage parking flow",
        notionLink: null,
        startTime: slotTimeApril10(7, 0),
        endTime: slotTimeApril10(19, 0),
        headcount: 3,
      },
    ],
  },
  {
    slotTime: slotTimeApril10(7, 30),
    totalHeadcount: 3,
    shifts: [
      {
        shiftId: "shift-8",
        location: "Parking Lot",
        task: "Traffic Direction",
        description: "Guide vehicles and manage parking flow",
        notionLink: null,
        startTime: slotTimeApril10(7, 0),
        endTime: slotTimeApril10(19, 0),
        headcount: 3,
      },
    ],
  },
];

const mockUser = {
  id: "user-1",
  name: "Max Mustermann",
  email: "max@example.com",
  image: "https://i.pravatar.cc/150?u=calendar-view",
};

function createCalendarHandlers(
  options: {
    division?: "chair" | "tech";
    calendarSlots?: unknown[];
  } = {},
) {
  const { division = "chair", calendarSlots = [] } = options;

  return [
    trpcQuery("profile", "getMy", () => ({
      user: mockUser,
      profile: {
        id: "profile-1",
        userId: "user-1",
        status: "active" as const,
        division,
        team: "board",
        lastActiveYear: 2025,
        teamOther: null,
        phoneNumber: null,
        privateEmail: null,
        linkedInUrl: null,
        talentIds: [],
      },
    })),
    trpcQuery("shift", "list", () => ({
      items: [],
      total: 0,
      nextCursor: null,
    })),
    trpcQuery("shift", "calendar", () => calendarSlots),
  ];
}

/* ──────────────────────────────────────────────────────────────────────────
 * Stories
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Loading state - shows skeleton placeholders while data is being fetched.
 */
export const Loading: Story = {
  args: {
    slots: [],
    selectedDate: april9Date,
    isLoading: true,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers(),
    },
  },
};

/**
 * Empty state - no shifts scheduled for the selected day.
 */
export const Empty: Story = {
  args: {
    slots: [],
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({ calendarSlots: [] }),
    },
  },
};

/**
 * Populated state - multiple shifts across different locations and times.
 * Shows the full calendar grid with headcounts.
 */
export const Populated: Story = {
  args: {
    slots: mockCalendarSlotsApril9,
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({ calendarSlots: mockCalendarSlotsApril9 }),
    },
  },
};

/**
 * April 10 view - shows shifts for the second day of Q-Summit.
 */
export const April10: Story = {
  args: {
    slots: mockCalendarSlotsApril10,
    selectedDate: april10Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({ calendarSlots: mockCalendarSlotsApril10 }),
    },
  },
};

/**
 * Single location - only one location has shifts scheduled.
 */
export const SingleLocation: Story = {
  args: {
    slots: [
      {
        slotTime: slotTime(9, 0),
        totalHeadcount: 2,
        shifts: [
          {
            shiftId: "shift-1",
            location: "Conference Hall A",
            task: "Registration",
            description: "Handle participant check-ins",
            notionLink: null,
            startTime: slotTime(9, 0),
            endTime: slotTime(12, 0),
            headcount: 2,
          },
        ],
      },
      {
        slotTime: slotTime(9, 30),
        totalHeadcount: 2,
        shifts: [
          {
            shiftId: "shift-1",
            location: "Conference Hall A",
            task: "Registration",
            description: "Handle participant check-ins",
            notionLink: null,
            startTime: slotTime(9, 0),
            endTime: slotTime(12, 0),
            headcount: 2,
          },
        ],
      },
    ],
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({
        calendarSlots: [
          {
            slotTime: slotTime(9, 0),
            totalHeadcount: 2,
            shifts: [
              {
                shiftId: "shift-1",
                location: "Conference Hall A",
                task: "Registration",
                description: "Handle participant check-ins",
                notionLink: null,
                startTime: slotTime(9, 0),
                endTime: slotTime(12, 0),
                headcount: 2,
              },
            ],
          },
          {
            slotTime: slotTime(9, 30),
            totalHeadcount: 2,
            shifts: [
              {
                shiftId: "shift-1",
                location: "Conference Hall A",
                task: "Registration",
                description: "Handle participant check-ins",
                notionLink: null,
                startTime: slotTime(9, 0),
                endTime: slotTime(12, 0),
                headcount: 2,
              },
            ],
          },
        ],
      }),
    },
  },
};

/**
 * High headcount - demonstrates cells with large volunteer numbers.
 */
export const HighHeadcount: Story = {
  args: {
    slots: [
      {
        slotTime: slotTime(12, 0),
        totalHeadcount: 25,
        shifts: [
          {
            shiftId: "shift-1",
            location: "Catering Area",
            task: "Lunch Service",
            description: "Serve lunch to all attendees",
            notionLink: null,
            startTime: slotTime(12, 0),
            endTime: slotTime(14, 0),
            headcount: 15,
          },
          {
            shiftId: "shift-2",
            location: "Conference Hall A",
            task: "Session Support",
            description: "Assist with main session",
            notionLink: null,
            startTime: slotTime(12, 0),
            endTime: slotTime(14, 0),
            headcount: 10,
          },
        ],
      },
      {
        slotTime: slotTime(12, 30),
        totalHeadcount: 25,
        shifts: [
          {
            shiftId: "shift-1",
            location: "Catering Area",
            task: "Lunch Service",
            description: "Serve lunch to all attendees",
            notionLink: null,
            startTime: slotTime(12, 0),
            endTime: slotTime(14, 0),
            headcount: 15,
          },
          {
            shiftId: "shift-2",
            location: "Conference Hall A",
            task: "Session Support",
            description: "Assist with main session",
            notionLink: null,
            startTime: slotTime(12, 0),
            endTime: slotTime(14, 0),
            headcount: 10,
          },
        ],
      },
    ],
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({
        calendarSlots: [
          {
            slotTime: slotTime(12, 0),
            totalHeadcount: 25,
            shifts: [
              {
                shiftId: "shift-1",
                location: "Catering Area",
                task: "Lunch Service",
                description: "Serve lunch to all attendees",
                notionLink: null,
                startTime: slotTime(12, 0),
                endTime: slotTime(14, 0),
                headcount: 15,
              },
              {
                shiftId: "shift-2",
                location: "Conference Hall A",
                task: "Session Support",
                description: "Assist with main session",
                notionLink: null,
                startTime: slotTime(12, 0),
                endTime: slotTime(14, 0),
                headcount: 10,
              },
            ],
          },
          {
            slotTime: slotTime(12, 30),
            totalHeadcount: 25,
            shifts: [
              {
                shiftId: "shift-1",
                location: "Catering Area",
                task: "Lunch Service",
                description: "Serve lunch to all attendees",
                notionLink: null,
                startTime: slotTime(12, 0),
                endTime: slotTime(14, 0),
                headcount: 15,
              },
              {
                shiftId: "shift-2",
                location: "Conference Hall A",
                task: "Session Support",
                description: "Assist with main session",
                notionLink: null,
                startTime: slotTime(12, 0),
                endTime: slotTime(14, 0),
                headcount: 10,
              },
            ],
          },
        ],
      }),
    },
  },
};

/**
 * Zero headcount - shows shifts with no volunteers assigned.
 */
export const ZeroHeadcount: Story = {
  args: {
    slots: [
      {
        slotTime: slotTime(10, 0),
        totalHeadcount: 0,
        shifts: [
          {
            shiftId: "shift-1",
            location: "Munich Central Station",
            task: "Info Desk",
            description: "Information desk for attendees",
            notionLink: null,
            startTime: slotTime(10, 0),
            endTime: slotTime(12, 0),
            headcount: 0,
          },
        ],
      },
    ],
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({
        calendarSlots: [
          {
            slotTime: slotTime(10, 0),
            totalHeadcount: 0,
            shifts: [
              {
                shiftId: "shift-1",
                location: "Munich Central Station",
                task: "Info Desk",
                description: "Information desk for attendees",
                notionLink: null,
                startTime: slotTime(10, 0),
                endTime: slotTime(12, 0),
                headcount: 0,
              },
            ],
          },
        ],
      }),
    },
  },
};

/**
 * Many locations - demonstrates the grid with many different locations.
 */
export const ManyLocations: Story = {
  args: {
    slots: [
      {
        slotTime: slotTime(9, 0),
        totalHeadcount: 12,
        shifts: [
          {
            shiftId: "shift-1",
            location: "Main Entrance",
            task: "Registration",
            description: "Handle check-ins",
            notionLink: null,
            startTime: slotTime(9, 0),
            endTime: slotTime(12, 0),
            headcount: 3,
          },
          {
            shiftId: "shift-2",
            location: "Hall A",
            task: "Setup",
            description: "Setup equipment",
            notionLink: null,
            startTime: slotTime(9, 0),
            endTime: slotTime(11, 0),
            headcount: 2,
          },
          {
            shiftId: "shift-3",
            location: "Hall B",
            task: "Setup",
            description: "Setup equipment",
            notionLink: null,
            startTime: slotTime(9, 0),
            endTime: slotTime(11, 0),
            headcount: 2,
          },
          {
            shiftId: "shift-4",
            location: "Catering",
            task: "Prep",
            description: "Food preparation",
            notionLink: null,
            startTime: slotTime(9, 0),
            endTime: slotTime(14, 0),
            headcount: 5,
          },
        ],
      },
    ],
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({
        calendarSlots: [
          {
            slotTime: slotTime(9, 0),
            totalHeadcount: 12,
            shifts: [
              {
                shiftId: "shift-1",
                location: "Main Entrance",
                task: "Registration",
                description: "Handle check-ins",
                notionLink: null,
                startTime: slotTime(9, 0),
                endTime: slotTime(12, 0),
                headcount: 3,
              },
              {
                shiftId: "shift-2",
                location: "Hall A",
                task: "Setup",
                description: "Setup equipment",
                notionLink: null,
                startTime: slotTime(9, 0),
                endTime: slotTime(11, 0),
                headcount: 2,
              },
              {
                shiftId: "shift-3",
                location: "Hall B",
                task: "Setup",
                description: "Setup equipment",
                notionLink: null,
                startTime: slotTime(9, 0),
                endTime: slotTime(11, 0),
                headcount: 2,
              },
              {
                shiftId: "shift-4",
                location: "Catering",
                task: "Prep",
                description: "Food preparation",
                notionLink: null,
                startTime: slotTime(9, 0),
                endTime: slotTime(14, 0),
                headcount: 5,
              },
            ],
          },
        ],
      }),
    },
  },
};

/**
 * Non-planner view - shows the calendar from a regular volunteer's perspective.
 */
export const NonPlanner: Story = {
  args: {
    slots: mockCalendarSlotsApril9,
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({
        division: "tech",
        calendarSlots: mockCalendarSlotsApril9,
      }),
    },
  },
};

/**
 * Interactive story - demonstrates clicking on cells to view shift details.
 * Click on any cell with a headcount badge to open the details modal.
 */
export const Interactive: Story = {
  args: {
    slots: mockCalendarSlotsApril9,
    selectedDate: april9Date,
    isLoading: false,
  },
  parameters: {
    msw: {
      handlers: createCalendarHandlers({ calendarSlots: mockCalendarSlotsApril9 }),
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Find and click a cell with headcount (Catering Area at 12:00)
    // Note: bg-primary/5 is the actual class used for cells with shifts
    const cells = canvasElement.querySelectorAll('[class*="cursor-pointer"]');
    const shiftCells = Array.from(cells).filter((cell) => {
      const className = cell.className || "";
      return className.includes("bg-primary") || className.includes("bg-");
    });
    if (shiftCells.length > 0) {
      (shiftCells[0] as HTMLElement).click();
    }
  },
};
