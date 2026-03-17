/**
 * Stories for the ShiftForm component.
 *
 * Uses MSW to mock tRPC endpoints so the component renders with realistic data.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { http, HttpResponse } from "msw";
import { trpcMutation, trpcQuery } from "../../../.storybook/utils/trpc-helpers";
import { ShiftForm } from "./shift-form";

const meta = {
  title: "Shifts/ShiftForm",
  component: ShiftForm,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ShiftForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for talents query
const mockTalents = [
  { id: "talent-1", category: "driver_license", key: "driver_18plus" },
  { id: "talent-2", category: "driver_license", key: "driver_21plus" },
  { id: "talent-3", category: "driver_license", key: "driver_c1" },
  { id: "talent-4", category: "gastronomy", key: "gastro" },
];

const mockUser = {
  id: "user-1",
  name: "Max Mustermann",
  email: "max@example.com",
  image: "https://i.pravatar.cc/150?u=shift-form",
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
  talentIds: ["talent-1", "talent-3"],
};

const mockShiftListResponse = {
  items: [],
  total: 0,
  nextCursor: null,
};

function createBaseHandlers() {
  return [
    trpcQuery("profile", "getMy", () => ({
      user: mockUser,
      profile: mockPlannerProfile,
    })),
    trpcQuery("shift", "list", () => mockShiftListResponse),
    trpcQuery("shift", "calendar", () => []),
  ];
}

/**
 * Default form with talents loaded.
 * Fill in the form and click "Create Shift" to submit.
 */
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createBaseHandlers(),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcMutation("shift", "create", () => ({ ok: true, id: "shift-123" })),
      ],
    },
  },
};

/**
 * Loading state - talents are being fetched.
 * Shows the form with loading indicators.
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createBaseHandlers(),
        trpcQuery("profile", "listTalents", async () => {
          // Simulate slow network
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return mockTalents;
        }),
      ],
    },
  },
};

/**
 * Success state - shift created successfully.
 * The form submits and calls onSuccess callback.
 */
export const Success: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createBaseHandlers(),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcMutation("shift", "create", () => ({ ok: true, id: "shift-456" })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for form to be ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = canvasElement;

    // Fill in location
    const locationInput = canvas.querySelector(
      'input[placeholder="Enter location"]',
    ) as unknown as HTMLInputElement | null;
    if (locationInput) {
      locationInput.value = "Main Stage";
      locationInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Fill in task
    const taskInput = canvas.querySelector(
      'input[placeholder="Enter task description"]',
    ) as unknown as HTMLInputElement | null;
    if (taskInput) {
      taskInput.value = "Setup and teardown";
      taskInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Fill in start time
    const startTimeInput = canvas.querySelector(
      'input[type="datetime-local"]',
    ) as unknown as HTMLInputElement | null;
    if (startTimeInput) {
      // Set to tomorrow at 9:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      startTimeInput.value = tomorrow.toISOString().slice(0, 16);
      startTimeInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Fill in end time
    const endTimeInputs = canvas.querySelectorAll(
      'input[type="datetime-local"]',
    ) as unknown as NodeListOf<HTMLInputElement>;
    if (endTimeInputs.length > 1) {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(17, 0, 0, 0);
      endTimeInputs[1].value = endTime.toISOString().slice(0, 16);
      endTimeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    }
  },
};

/**
 * Error state - validation errors from the server.
 * Shows error banner when submission fails.
 */
export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createBaseHandlers(),
        trpcQuery("profile", "listTalents", () => mockTalents),
        http.post("*/api/trpc/shift.create", () =>
          HttpResponse.json(
            {
              id: null,
              error: {
                message: "End time must be after start time",
                code: -32603,
                data: {
                  code: "BAD_REQUEST",
                  httpStatus: 400,
                },
              },
            },
            { status: 400 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for form to be ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = canvasElement;

    // Fill in location
    const locationInput = canvas.querySelector(
      'input[placeholder="Enter location"]',
    ) as unknown as HTMLInputElement | null;
    if (locationInput) {
      locationInput.value = "Main Stage";
      locationInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Fill in task
    const taskInput = canvas.querySelector(
      'input[placeholder="Enter task description"]',
    ) as unknown as HTMLInputElement | null;
    if (taskInput) {
      taskInput.value = "Setup";
      taskInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Fill in start time
    const startTimeInput = canvas.querySelector(
      'input[type="datetime-local"]',
    ) as unknown as HTMLInputElement | null;
    if (startTimeInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      startTimeInput.value = tomorrow.toISOString().slice(0, 16);
      startTimeInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Fill in end time (before start time to trigger error)
    const endTimeInputs = canvas.querySelectorAll(
      'input[type="datetime-local"]',
    ) as unknown as NodeListOf<HTMLInputElement>;
    if (endTimeInputs.length > 1) {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(8, 0, 0, 0); // Before start time
      endTimeInputs[1].value = endTime.toISOString().slice(0, 16);
      endTimeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Click submit button
    const submitButton = canvas.querySelector('button[type="button"]');
    if (submitButton?.textContent?.includes("Create")) {
      (submitButton as HTMLButtonElement).click();
    }
  },
};

/**
 * Form with pre-selected skills and tools.
 * Shows the form with some options already selected.
 */
export const WithSelections: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createBaseHandlers(),
        trpcQuery("profile", "listTalents", () => mockTalents),
        trpcMutation("shift", "create", () => ({ ok: true, id: "shift-789" })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for form to be ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = canvasElement;

    // Fill in required fields
    const locationInput = canvas.querySelector(
      'input[placeholder="Enter location"]',
    ) as unknown as HTMLInputElement | null;
    if (locationInput) {
      locationInput.value = "Catering Area";
      locationInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const taskInput = canvas.querySelector(
      'input[placeholder="Enter task description"]',
    ) as unknown as HTMLInputElement | null;
    if (taskInput) {
      taskInput.value = "Food service";
      taskInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Set times
    const startTimeInput = canvas.querySelector(
      'input[type="datetime-local"]',
    ) as unknown as HTMLInputElement | null;
    if (startTimeInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      startTimeInput.value = tomorrow.toISOString().slice(0, 16);
      startTimeInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const endTimeInputs = canvas.querySelectorAll(
      'input[type="datetime-local"]',
    ) as unknown as NodeListOf<HTMLInputElement>;
    if (endTimeInputs.length > 1) {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(14, 0, 0, 0);
      endTimeInputs[1].value = endTime.toISOString().slice(0, 16);
      endTimeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Click on skill buttons to select them
    const buttons = canvas.querySelectorAll('button[type="button"]');
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || "";
      if (text.includes("gastro") || text.includes("driver_18plus")) {
        (button as HTMLButtonElement).click();
      }
    }

    // Click on tool buttons to select them
    for (const button of buttons) {
      const text = button.textContent?.toLowerCase() || "";
      if (text.includes("car")) {
        (button as HTMLButtonElement).click();
      }
    }
  },
};

/**
 * Empty talents state - no skills available.
 * Shows the form without the skills section.
 */
export const NoTalents: Story = {
  parameters: {
    msw: {
      handlers: [
        ...createBaseHandlers(),
        trpcQuery("profile", "listTalents", () => []),
        trpcMutation("shift", "create", () => ({ ok: true, id: "shift-abc" })),
      ],
    },
  },
};
