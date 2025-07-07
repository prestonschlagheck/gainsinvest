'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'

const UserProfile: React.FC = () => {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!session?.user) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: window.location.origin })
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Profile Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-full p-2 border border-gray-600 transition-colors"
        >
          {/* Profile Image */}
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          
          {/* User Name */}
          <span className="text-white text-sm font-medium max-w-24 truncate">
            {session.user.name || 'User'}
          </span>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-transparent"
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg border border-gray-600 shadow-lg overflow-hidden"
              >
                {/* User Info */}
                <div className="p-3 border-b border-gray-600">
                  <div className="flex items-center gap-3">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">
                        {session.user.name || 'User'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="w-full p-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default UserProfile 