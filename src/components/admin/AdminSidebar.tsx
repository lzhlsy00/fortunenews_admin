'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function AdminSidebar() {
  const [activeMenu, setActiveMenu] = useState('news')
  const { logout } = useAuth()

  const menuItems = [
    {
      id: 'news',
      name: 'News',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      href: '/admin'
    }
  ]

  return (
    <aside className="w-64 bg-black min-h-screen flex flex-col">
      {/* 顶部Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="block">
          <div className="text-2xl font-bold text-white">FortuneNews</div>
        </Link>
      </div>

      {/* 菜单区域 */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveMenu(item.id)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                activeMenu === item.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* 底部退出登录 */}
      <div className="p-6 border-t border-gray-800">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              logout()
            }
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
