import './globals.css'

export const metadata = {
  title: 'Claude Workflow Manager',
  description: 'Manage architecture, agents, user stories and tasks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  )
}