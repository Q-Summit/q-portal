/**
 * Stories for the CsvExportButton component.
 *
 * Uses MSW to mock tRPC endpoints so the component renders with realistic data.
 * Demonstrates default, loading, success, and error states.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { http, HttpResponse } from "msw";
import { trpcMutation } from "../../../.storybook/utils/trpc-helpers";
import { CsvExportButton } from "./csv-export-button";

const meta = {
  title: "Shifts/CsvExportButton",
  component: CsvExportButton,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CsvExportButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample CSV content for mock responses
const mockCsvContent = `shift_id;location;task;start_time;end_time;slot_time;headcount;skills;tools;notion_link
shift-1;Munich Central Station;Registration Desk;2026-04-09 08:00:00;2026-04-09 12:00:00;2026-04-09 08:00:00;2;driver_18plus;car;https://notion.so/shift-1
shift-1;Munich Central Station;Registration Desk;2026-04-09 08:00:00;2026-04-09 12:00:00;2026-04-09 08:30:00;2;driver_18plus;car;https://notion.so/shift-1
shift-2;Conference Hall A;Stage Setup;2026-04-09 06:00:00;2026-04-09 09:00:00;2026-04-09 06:00:00;1;gastro;;`;

/**
 * Default state - button ready to export.
 * Click to trigger CSV download.
 */
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMutation("shift", "exportCsv", () => ({
          csv: mockCsvContent,
        })),
      ],
    },
  },
};

/**
 * Loading state - export in progress.
 * Shows spinner while waiting for response.
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMutation("shift", "exportCsv", async () => {
          // Simulate slow network
          await new Promise((resolve) => setTimeout(resolve, 100000));
          return { csv: mockCsvContent };
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Click the export button to trigger loading state
    const button = canvasElement.querySelector("button");
    if (button) {
      button.click();
    }
  },
};

/**
 * Success state - after successful export.
 * The button returns to normal state after download.
 */
export const WithSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMutation("shift", "exportCsv", () => ({
          csv: mockCsvContent,
        })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Click the export button
    const button = canvasElement.querySelector("button");
    if (button) {
      button.click();
    }
  },
};

/**
 * Error state - when export fails.
 * Shows error handling behavior.
 */
export const WithError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/api/trpc", async ({ request }) => {
          const body = (await request.json()) as { json?: { params?: { path?: string } } };
          const path = body?.json?.params?.path;

          if (path === "shift.exportCsv") {
            return HttpResponse.json(
              {
                id: null,
                error: {
                  message: "Failed to export shifts",
                  code: -32603,
                  data: {
                    code: "INTERNAL_SERVER_ERROR",
                    httpStatus: 500,
                  },
                },
              },
              { status: 500 },
            );
          }

          return undefined;
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Click the export button to trigger error
    const button = canvasElement.querySelector("button");
    if (button) {
      button.click();
    }
  },
};

/**
 * Empty export - no shifts to export.
 * Returns CSV with header only.
 */
export const EmptyExport: Story = {
  parameters: {
    msw: {
      handlers: [
        trpcMutation("shift", "exportCsv", () => ({
          csv: "shift_id;location;task;start_time;end_time;slot_time;headcount;skills;tools;notion_link",
        })),
      ],
    },
  },
};
