import './globals.css'

export const metadata = {
  title: 'Painel COVID-19 - Nordeste Brasileiro',
  description: 'Dashboard interativo com dados da COVID-19 para os estados do Nordeste do Brasil',
  keywords: ['covid-19', 'nordeste', 'brasil', 'dashboard', 'dados'],
  authors: [{ name: 'Kaynan Pereira de Sousa' }],
  openGraph: {
    title: 'Painel COVID-19 - Nordeste Brasileiro',
    description: 'Dashboard interativo com dados da COVID-19',
    type: 'website',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}