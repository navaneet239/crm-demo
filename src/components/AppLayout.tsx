import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const AppLayout: React.FC = () => {
  const { currentUser, logout, changeRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentUser?.role) return;
    setSwitchingRole(true);
    try {
      await changeRole(newRole);
      // If Agent was on settings, redirect to clients
      if (newRole === 'Agent' && window.location.pathname.startsWith('/settings')) {
        navigate('/clients');
      }
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAgent = currentUser?.role === 'Agent';

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F6F8FB] flex flex-col md:flex-row text-[#101828]">
      {/* Desktop & Tablet Sidebar - Fixed Height */}
      <aside
        className={`hidden md:flex flex-col justify-between h-screen sticky top-0 bg-white border-r border-[#DDE3EC] transition-all duration-200 z-30 shrink-0 select-none ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Top brand & navigation (scrollable nav if needed, fixed brand) */}
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Header Brand */}
          <div className="h-16 shrink-0 flex items-center justify-between px-4 border-b border-[#DDE3EC]">
            {!collapsed && (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-[6px] bg-[#004080] flex items-center justify-center text-white shrink-0">
                  <Building2 size={18} strokeWidth={1.75} />
                </div>
                <div className="leading-tight truncate">
                  <span className="font-serif font-semibold text-sm tracking-wide text-[#101828] block truncate">
                    EMIRATES ADVISORY
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#004080] font-semibold block">
                    Brokerage CRM
                  </span>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 mx-auto rounded-[6px] bg-[#004080] flex items-center justify-center text-white">
                <Building2 size={18} strokeWidth={1.75} />
              </div>
            )}
            <button
              id="collapse-sidebar-btn"
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9] transition-colors cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight size={16} strokeWidth={1.75} />
              ) : (
                <ChevronLeft size={16} strokeWidth={1.75} />
              )}
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            <NavLink
              to="/clients"
              id="nav-clients"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-[#E7EEF7] text-[#004080] font-semibold'
                    : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#004080] rounded-r" />
                  )}
                  <Users size={18} strokeWidth={1.75} className="shrink-0" />
                  {!collapsed && <span>Clients</span>}
                </>
              )}
            </NavLink>

            <NavLink
              to="/pipeline"
              id="nav-pipeline"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-[#E7EEF7] text-[#004080] font-semibold'
                    : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#004080] rounded-r" />
                  )}
                  <Columns3 size={18} strokeWidth={1.75} className="shrink-0" />
                  {!collapsed && <span>Pipeline</span>}
                </>
              )}
            </NavLink>

            {/* Agent cannot see Settings screen */}
            {!isAgent && (
              <NavLink
                to="/settings"
                id="nav-settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-[#E7EEF7] text-[#004080] font-semibold'
                      : 'text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#004080] rounded-r" />
                    )}
                    <SettingsIcon
                      size={18}
                      strokeWidth={1.75}
                      className="shrink-0"
                    />
                    {!collapsed && <span>Settings</span>}
                  </>
                )}
              </NavLink>
            )}
          </nav>
        </div>

        {/* Footer Role Switcher & User Session Block - Fixed at bottom */}
        <div className="shrink-0 border-t border-[#DDE3EC] p-3 space-y-3 bg-[#FFFFFF]">
          {/* Role Switcher */}
          {!collapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
                  Active Role
                </span>
                {switchingRole && (
                  <span className="text-[10px] text-[#5C6880] animate-pulse">
                    Switching...
                  </span>
                )}
              </div>
              <div
                id="role-switcher-buttons"
                className="grid grid-cols-3 gap-1 bg-[#F0F4F9] p-1 rounded-[6px] border border-[#DDE3EC]"
              >
                {(['Admin', 'Manager', 'Agent'] as Role[]).map((r) => {
                  const isActive = currentUser?.role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      disabled={switchingRole}
                      onClick={() => handleRoleChange(r)}
                      id={`role-switch-${r.toLowerCase()}`}
                      className={`text-[11px] py-1 rounded font-medium transition-all text-center ${
                        isActive
                          ? 'bg-white text-[#004080] font-semibold shadow-xs border border-[#DDE3EC]'
                          : 'text-[#5C6880] hover:text-[#101828]'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {isAgent && (
                <p className="text-[10px] text-[#5C6880] leading-tight pt-0.5">
                  Agent view: filtered to your assigned clients only.
                </p>
              )}
            </div>
          ) : (
            <div className="flex justify-center" title={`Current role: ${currentUser?.role}`}>
              <span className="w-8 h-8 rounded-full bg-[#E7EEF7] text-[#004080] flex items-center justify-center text-xs font-semibold">
                {currentUser?.role[0]}
              </span>
            </div>
          )}

          {/* User Session Block */}
          <div className="pt-2 border-t border-[#DDE3EC]">
            {!collapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#E7EEF7] text-[#004080] font-medium text-xs flex items-center justify-center shrink-0 border border-[#DDE3EC]">
                    {currentUser?.avatarInitial || 'SM'}
                  </div>
                  <div className="truncate text-left leading-tight">
                    <p className="text-xs font-semibold text-[#101828] truncate">
                      {currentUser?.name || 'Sarah Al-Maktoum'}
                    </p>
                    <p className="text-[10px] text-[#5C6880] truncate">
                      {currentUser?.role}
                    </p>
                  </div>
                </div>
                <button
                  id="sign-out-btn"
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-[#5C6880] hover:text-[#B42318] p-1.5 rounded transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <button
                id="sign-out-btn-collapsed"
                type="button"
                onClick={handleLogout}
                className="w-full flex justify-center p-2 text-[#5C6880] hover:text-[#B42318]"
                title="Sign out"
              >
                <LogOut size={16} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-[#DDE3EC] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#004080] flex items-center justify-center text-white">
            <Building2 size={15} strokeWidth={1.75} />
          </div>
          <div>
            <span className="font-serif font-semibold text-xs tracking-wide text-[#101828] block">
              EMIRATES ADVISORY
            </span>
            <span className="text-[9px] uppercase tracking-[0.14em] text-[#004080] font-semibold block">
              Brokerage CRM
            </span>
          </div>
        </div>

        {/* Mobile Quick Role Selector */}
        <div className="flex items-center gap-2">
          <select
            id="mobile-role-switcher"
            value={currentUser?.role}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            className="text-[11px] font-semibold bg-[#F0F4F9] text-[#004080] border border-[#DDE3EC] rounded px-2 py-1"
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Agent">Agent</option>
          </select>
          <button
            onClick={handleLogout}
            className="text-[#5C6880] hover:text-[#B42318] p-1.5"
            title="Sign out"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* Main Content Area - Independent Scroll */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDE3EC] flex items-center justify-around py-2 z-40">
        <NavLink
          to="/clients"
          id="mobile-nav-clients"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? 'text-[#004080] font-semibold' : 'text-[#5C6880]'
            }`
          }
        >
          <Users size={18} strokeWidth={1.75} />
          <span>Clients</span>
        </NavLink>

        <NavLink
          to="/pipeline"
          id="mobile-nav-pipeline"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? 'text-[#004080] font-semibold' : 'text-[#5C6880]'
            }`
          }
        >
          <Columns3 size={18} strokeWidth={1.75} />
          <span>Pipeline</span>
        </NavLink>

        {!isAgent && (
          <NavLink
            to="/settings"
            id="mobile-nav-settings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-medium ${
                isActive ? 'text-[#004080] font-semibold' : 'text-[#5C6880]'
              }`
            }
          >
            <SettingsIcon size={18} strokeWidth={1.75} />
            <span>Settings</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};
