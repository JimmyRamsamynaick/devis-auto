'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Files, 
  Users, 
  Settings, 
  LogOut,
  PlusCircle,
  X
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/quotes', label: 'Devis', icon: FileText },
  { href: '/purchase-orders', label: 'Bons de Commande', icon: FileText },
  { href: '/invoices', label: 'Factures', icon: Files },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/services', label: 'Prestations', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={`
      w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
      <div className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Auto Devis</h1>
          <p className="text-xs text-gray-400 mt-1">Gestion IT</p>
        </div>
        {/* Mobile Close Button */}
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="px-4 mb-6">
        <Link 
          href="/quotes/new" 
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
        >
          <PlusCircle size={18} />
          <span>Nouveau Devis</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-slate-800 text-blue-400' 
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-2 w-full text-gray-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
