import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Image src="/로고.png" alt="CAYSON" width={32} height={32} className="rounded-lg" />
              <span className="text-xl text-white font-black">CAYSON</span>
            </div>
          </div>
          <div className="text-sm text-center md:text-right">
            <p>&copy; {currentYear} CAYSON TECH. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
