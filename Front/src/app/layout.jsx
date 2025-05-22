import "./styles/globals.css";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
 // weight: ['400'],  también puedes probar '300'
  subsets: ['latin'],
});

export default function DashboardLayout({ children }) {
  return (
    <html lang="es">
      <body className={'${roboto.className} antialiased'}>
        {/* Layout UI */}
        {/* Place children where you want to render a page or nested Layout */}
        <main>{children}</main>
      </body>
    </html>
  );
}
