import './globals.css';

export const metadata = {
  title: 'Everyday Goods Store',
  description: 'Shop household goods, tools, accessories and everyday essentials.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
