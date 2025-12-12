export const metadata = {
  title: 'Sitecore Design MCP Server',
  description: 'MCP Server with RAG capabilities for Sitecore Design documentation',
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

