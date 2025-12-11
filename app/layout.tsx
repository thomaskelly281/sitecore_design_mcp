export const metadata = {
  title: 'Sitecore Design MCP',
  description: 'MCP Server with Copywriter Agent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

