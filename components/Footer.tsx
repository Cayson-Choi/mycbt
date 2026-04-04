export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="" className="w-7 h-7 object-contain" />
              <span className="text-white font-bold">전기짱</span>
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
