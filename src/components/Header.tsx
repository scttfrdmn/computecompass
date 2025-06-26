import { ComputerDesktopIcon } from '@heroicons/react/24/outline'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <ComputerDesktopIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ComputeCompass
              </h1>
              <p className="text-sm text-gray-500">
                AWS Instance Selector for Research Computing
              </p>
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <a
              href="#workloads"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Workloads
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              About
            </a>
            <a
              href="https://github.com/scttfrdmn/computecompass"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
