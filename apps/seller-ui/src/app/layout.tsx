import './global.css';
import { Providers } from './providers';
import { Poppins } from "next/font/google"

export const metadata = {
  title: 'Eshop-Seller',
  description: 'Seller Workspace',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '800', '900', '700'],
  variable: '--font-poppins',
})

// const roboto = Roboto({
//   subsets: ['latin'],
//   weight: ['100', '300', '400', '500', '900', '700'],
//   variable: '--font-roboto',
// })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-slate-900 font-sans antialiased ${poppins.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
