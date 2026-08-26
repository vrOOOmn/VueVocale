import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "./globals.css";

import type { Viewport } from "next";
import Providers from "./providers";

export const metadata = {
  title: "VueVocale",
  description: "A conversational French learning companion",
};

// Without this, mobile browsers assume a ~980px desktop layout and scale
// the whole page down to fit, which reads as the page being zoomed in.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Chromium honours this by shrinking the layout viewport when the on-screen
  // keyboard opens, so fixed chrome lands above it for free. Safari ignores
  // it — Chat's visualViewport listener (--kb-inset) covers that case.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
