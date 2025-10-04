import { Navigation, Wifi, WifiOff, Loader2 } from "lucide-react"
import { useNavigationStore } from "../store/navigationStore"

export default function Header() {
  const { connectionStatus } = useNavigationStore()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Smart Navigation System</h1>
            <p className="text-sm text-gray-500">Real-time route optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connectionStatus === "connected" ? (
            <>
              <Wifi className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Connected</span>
            </>
          ) : connectionStatus === "connecting" ? (
            <>
              <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
              <span className="text-sm font-medium text-yellow-600">Connecting...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">Disconnected</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
