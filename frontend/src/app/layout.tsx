import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import './globals.css';
import { Providers } from './providers';

// We import FontAwesome's CSS ourselves, so stop it injecting a second copy
// (otherwise icons flash at huge size on first paint).
config.autoAddCss = false;

export const metadata: Metadata = {
  title: 'Service Request Tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}