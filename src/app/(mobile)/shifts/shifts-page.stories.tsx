/**
 * Stories for the Shifts page layout.
 *
 * Shows the full mobile app shell with shifts content.
 */

import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calendar, Clock, MapPin } from "lucide-react";

const meta = {
  title: "Pages/Shifts",
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/shifts",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface Shift {
  id: string;
  date: string;
  time: string;
  location: string;
  role: string;
}

function ShiftCard({ shift }: { shift: Shift }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-foreground">{shift.role}</div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{shift.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{shift.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{shift.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShiftsLayout({ shifts }: { shifts: Shift[] }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader
        user={{
          name: "Max Mustermann",
          image: "https://i.pravatar.cc/32?u=shifts",
        }}
      />
      <main className="flex-1 pb-20">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground">Shifts</h1>
          <p className="mt-2 text-muted-foreground">
            {shifts.length > 0 ? "Your upcoming shifts" : "Your upcoming shifts will appear here."}
          </p>
          {shifts.length > 0 && (
            <div className="mt-6 grid gap-3">
              {shifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

const mockShifts: Shift[] = [
  {
    id: "1",
    date: "Friday, Feb 27",
    time: "14:00 - 22:00",
    location: "Main Stage",
    role: "Runner",
  },
  {
    id: "2",
    date: "Saturday, Feb 28",
    time: "10:00 - 18:00",
    location: "Catering Area",
    role: "Gastro Support",
  },
  {
    id: "3",
    date: "Sunday, Mar 1",
    time: "08:00 - 16:00",
    location: "Logistics Hub",
    role: "Driver (C1)",
  },
];

/**
 * Shifts page with upcoming shifts.
 */
export const WithShifts: Story = {
  render: () => <ShiftsLayout shifts={mockShifts} />,
};

/**
 * Shifts page with no upcoming shifts.
 */
export const EmptyState: Story = {
  render: () => <ShiftsLayout shifts={[]} />,
};
