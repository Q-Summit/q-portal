import "@/styles/globals.css";
import { TRPCReactProvider } from "@/server/api/client";

export const metadata = {
  title: "Q Portal",
  description: "Q Portal",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
