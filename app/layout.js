import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ThinkingIsGood.tv',
  description: 'Thinking is good!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="stylesheet" href="https://use.typekit.net/fzx3dfn.css"/>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
