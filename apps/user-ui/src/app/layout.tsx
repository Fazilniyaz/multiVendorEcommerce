import './global.css';
import Header from '../shared/widgets/header';
import { Poppins, Roboto } from 'next/font/google';
import { Providers } from './providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '800', '900', '700'],
  variable: '--font-poppins',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '900', '700'],
  variable: '--font-roboto',
})

export const metadata = {
  title: 'Eshop - Multi Vendor Ecommerce',
  description: 'Multi Vendor Ecommerce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">

      <body className={`${poppins.variable} ${roboto.variable}`}>
        <Providers>
          <div className="hidden min-[800px]:block">
            <Header />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}
