import { useApp } from "../../context/AppContext"

const ConnectionStatus = () => {
  const { isConnected, error } = useApp()

  if (!isConnected && !error) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <div>
            <div className="text-sm font-semibold">Connecting to server...</div>
            <div className="text-xs opacity-90 mt-1">Checking http://localhost:5001</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-full bg-red-300 flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">✕</span>
            </div>
            <div className="text-sm font-semibold">Connection Failed</div>
          </div>
          <div className="text-xs opacity-90 pl-7">{error}</div>
          <div className="text-xs opacity-90 pl-7 pt-1 border-t border-red-400 mt-2">
            <strong>Fix:</strong> Make sure backend is running on port 5001
          </div>
        </div>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded-full bg-green-300 flex items-center justify-center">
            <span className="text-green-600 text-xs font-bold">✓</span>
          </div>
          <span className="text-sm font-semibold">Connected to Server</span>
        </div>
      </div>
    )
  }

  return null
}

export default ConnectionStatus
