import { api } from "@/server/api/server";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const caller = await api();
  const data = await caller.example.hello({ text: "from tRPC" });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Q <span className="text-[hsl(280,100%,70%)]">Portal</span>
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="text-2xl text-white">{data.greeting}</p>
          <Button variant="default" size="lg">
            Test Button
          </Button>
        </div>
      </div>
    </main>
  );
}
