import { Metadata } from "next";
import "./globals.css";
import ReduxProviderWrapper from "./components/Redux-provider-wrapper";

export const metadata: Metadata = {
  title: "Malooku | Everyday finds",
  description: "Discover style, thoughtful essentials, and your next favourite find at Malooku.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <ReduxProviderWrapper>{children}</ReduxProviderWrapper>
      </body>
    </html>
  );
}
