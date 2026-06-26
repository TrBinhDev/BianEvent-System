import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FestivalDecor from '@/components/common/FestivalDecor'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <FestivalDecor />
      <Navbar />
      <main className="min-h-screen relative z-10">
        {children}
      </main>
      <Footer />
    </>
  )
}