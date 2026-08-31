import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CubeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Equipment', href: '/my-equipment', icon: CubeIcon },
  { name: 'Equipment', href: '/equipment', icon: ComputerDesktopIcon, roles: ['IT_ADMIN', 'SYSTEM_ADMIN', 'MANAGER'] },
  { name: 'Requests', href: '/requests', icon: DocumentTextIcon },
  { name: 'Approvals', href: '/approvals', icon: CheckCircleIcon, roles: ['MANAGER', 'IT_ADMIN', 'SYSTEM_ADMIN'] },
  { name: 'Maintenance', href: '/maintenance', icon: WrenchScrewdriverIcon }
];

export default function Sidebar() {
  const { user } = useAuthStore();

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-primary-700 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 py-5 bg-primary-800">
          <h1 className="text-2xl font-bold text-white">EquipTrack</h1>
        </div>

        <nav className="mt-5 flex-1 px-3 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-800 text-white'
                    : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
