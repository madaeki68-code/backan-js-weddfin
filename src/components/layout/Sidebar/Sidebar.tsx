import React, { useMemo, useState, useEffect } from 'react';
import { ViewType, User, Profile } from '../../../types';
import { customizeNavigationLabel, customizeNavigationSection, useUiTextOverrides } from '../../../utils/uiTextCustomization';
import { ChevronDownIcon } from '../../../constants';
import { NAV_MENUS, NavMenuItem } from '../../../app/config/navigation';

export interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser: User | null;
  profile: Profile;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  activeView,
  setActiveView,
  isOpen,
  setIsOpen,
  currentUser,
  profile,
}) => {
  const uiTextOverrides = useUiTextOverrides();

  // Find which group currently contains the activeView
  const activeGroupId = useMemo(() => {
    for (const menu of NAV_MENUS) {
      if (menu.view === activeView) {
        return menu.id;
      }
      if (menu.items?.some(sub => sub.view === activeView)) {
        return menu.id;
      }
    }
    return null;
  }, [activeView]);

  // Accordion state: which accordion menu is currently expanded
  const [openGroupId, setOpenGroupId] = useState<string | null>(() => activeGroupId);

  // Automatically expand the accordion when activeView changes to one of its sub-items
  useEffect(() => {
    if (activeGroupId) {
      setOpenGroupId(activeGroupId);
    }
  }, [activeGroupId]);

  // Compute user permissions (Admin gets full access, Member gets configured permissions)
  const userPermissions = useMemo(() => {
    if (!currentUser) return new Set<ViewType>();
    if (currentUser.role === 'Admin') {
      return new Set(Object.values(ViewType));
    }
    return new Set(currentUser.permissions || []);
  }, [currentUser]);

  // Filter menus based on user role & permissions
  const visibleMenus = useMemo(() => {
    return NAV_MENUS.map(menu => {
      if (menu.view) {
        // Standalone menu
        if (!userPermissions.has(menu.view)) return null;
        return menu;
      }
      if (menu.items) {
        // Accordion menu: only keep permitted sub-items
        const visibleSubItems = menu.items.filter(sub => userPermissions.has(sub.view));
        // If no sub-items are permitted, hide the whole category
        if (visibleSubItems.length === 0) return null;
        return {
          ...menu,
          items: visibleSubItems,
        };
      }
      return null;
    }).filter((menu): menu is NavMenuItem => Boolean(menu));
  }, [userPermissions]);

  // Handle standalone menu navigation
  const handleStandaloneClick = (view: ViewType) => {
    React.startTransition(() => {
      setActiveView(view);
    });
    setIsOpen(false); // Auto-close on mobile
  };

  // Handle accordion toggle
  const handleGroupToggle = (groupId: string) => {
    setOpenGroupId(prev => (prev === groupId ? null : groupId));
  };

  // Handle sub-item navigation
  const handleSubItemClick = (view: ViewType) => {
    React.startTransition(() => {
      setActiveView(view);
    });
    setIsOpen(false); // Auto-close on mobile
  };

  // Handle scroll lock when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1280) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`
          fixed inset-0 
          bg-black/50 
          backdrop-blur-sm
          z-[45]
          xl:hidden 
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        id="sidebar"
        className={`
          fixed xl:fixed 
          inset-y-0 left-0 
          w-72 sm:w-80 xl:w-64
          bg-brand-surface 
          flex-col flex-shrink-0 flex 
          z-[50]
          transform transition-all duration-300 ease-out
          xl:translate-x-0
          border-r border-brand-border/50
          shadow-2xl xl:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          paddingTop: 'var(--safe-area-inset-top, 0px)',
          paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
          paddingLeft: 'var(--safe-area-inset-left, 0px)',
        }}
        aria-label="Navigasi Utama"
      >
        {/* Header with Logo */}
        <div className="
          h-16 sm:h-20 
          flex items-center 
          px-4 sm:px-6 
          border-b border-brand-border/50
          bg-brand-surface
        ">
          <div className="flex items-center gap-3">
            <div className="
              w-10 h-10 
              rounded-xl 
              bg-brand-surface
              flex items-center justify-center
              shadow-sm
              overflow-hidden
            ">
              {profile?.logoBase64 ? (
                <img
                  src={profile.logoBase64}
                  alt={profile.companyName || 'Company Logo'}
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/assets/images/logos/logoIcon.svg"
                  alt="Attera Visual Logo"
                  width="32"
                  height="32"
                  loading="lazy"
                  decoding="async"
                  className="w-8 h-8 object-contain"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="
                text-lg sm:text-xl 
                font-extrabold 
                text-brand-text-light
                select-none
                tracking-tight
                truncate
                block
              ">
                {profile?.companyName || 'Attera Visual'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav
          className="
            flex-1 
            px-3 sm:px-4 
            py-4 sm:py-6 
            overflow-y-auto 
            overscroll-contain
          "
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <ul className="space-y-1.5">
            {visibleMenus.map((menu, idx) => {
              const Icon = menu.icon;
              const sectionHeader = menu.section ? (
                <li key={`section-${menu.id}`} className={`${idx === 0 ? 'pt-0' : 'pt-4'} pb-1 px-3`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary/60 select-none">
                    {customizeNavigationSection(menu.section, uiTextOverrides)}
                  </p>
                </li>
              ) : null;

              // CASE 1: Standalone Single-view Menu
              if (menu.view) {
                const isActive = activeView === menu.view;

                return (
                  <React.Fragment key={menu.id}>
                    {sectionHeader}
                    <li>
                      <button
                        type="button"
                        onClick={() => handleStandaloneClick(menu.view!)}
                        className={`
                          w-full flex items-center 
                          px-3.5 sm:px-4 
                          py-2.5 sm:py-3 
                          text-sm font-semibold 
                          rounded-xl 
                          transition-all duration-200
                          group
                          relative
                          overflow-hidden
                          min-h-[44px]
                          cursor-pointer
                          text-left
                          ${isActive
                            ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/25 font-bold'
                            : 'text-[#2A3547] hover:bg-brand-accent/10 active:bg-brand-accent/10 hover:text-brand-accent'
                          }
                        `}
                      >
                        <div className="w-5 sm:w-6 mr-3 flex-shrink-0 flex items-center justify-center">
                          <Icon className={`
                            w-5 h-5
                            transition-all duration-200
                            ${isActive ? 'text-white' : 'text-[#5A6A85] group-hover:text-brand-accent'}
                          `} />
                        </div>

                        <span className="flex-1 truncate leading-tight">
                          {customizeNavigationLabel(menu.label, uiTextOverrides)}
                        </span>

                        {isActive && (
                          <div className="w-1.5 h-5 bg-white/40 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </button>
                    </li>
                  </React.Fragment>
                );
              }

              // CASE 2: Expandable Accordion Menu
              const isExpanded = openGroupId === menu.id;
              const isParentActive = Boolean(menu.items?.some(sub => sub.view === activeView));

              return (
                <React.Fragment key={menu.id}>
                  {sectionHeader}
                  <li>
                    <button
                      type="button"
                      onClick={() => handleGroupToggle(menu.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`submenu-${menu.id}`}
                      className={`
                        w-full flex items-center 
                        px-3.5 sm:px-4 
                        py-2.5 sm:py-3 
                        text-sm font-semibold 
                        rounded-xl 
                        transition-all duration-200
                        group
                        min-h-[44px]
                        cursor-pointer
                        text-left
                        ${isParentActive
                          ? 'bg-brand-accent text-white border border-transparent font-bold shadow-xs'
                          : 'text-[#2A3547] hover:bg-brand-accent/10 active:bg-brand-accent/10 hover:text-brand-accent border border-transparent'
                        }
                      `}
                    >
                      <div className="w-5 sm:w-6 mr-3 flex-shrink-0 flex items-center justify-center">
                        <Icon className={`
                          w-5 h-5
                          transition-all duration-200
                          ${isParentActive ? 'text-white' : 'text-[#5A6A85] group-hover:text-brand-accent'}
                        `} />
                      </div>

                      <span className="flex-1 truncate leading-tight">
                        {customizeNavigationLabel(menu.label, uiTextOverrides)}
                      </span>

                      {isParentActive && (
                        <span className="w-2 h-2 rounded-full bg-white flex-shrink-0 mr-2" />
                      )}

                      <ChevronDownIcon className={`
                        w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200
                        ${isExpanded ? 'rotate-180' : ''}
                        ${isParentActive ? 'text-white' : 'text-[#5A6A85] group-hover:text-brand-accent'}
                      `} />
                    </button>

                    {/* Submenu Items */}
                    <div
                      id={`submenu-${menu.id}`}
                      className={`
                        grid transition-all duration-200 ease-in-out
                        ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}
                      `}
                    >
                      <ul className="overflow-hidden pl-4 sm:pl-5 space-y-1 border-l-2 border-brand-border/60 ml-5 sm:ml-6 my-1">
                        {menu.items?.map(sub => {
                          const SubIcon = sub.icon;
                          const isSubActive = activeView === sub.view;

                          return (
                            <li key={sub.view}>
                              <button
                                type="button"
                                onClick={() => handleSubItemClick(sub.view)}
                                className={`
                                  w-full flex items-center 
                                  px-3 py-2 
                                  text-xs sm:text-sm 
                                  rounded-lg 
                                  transition-all duration-150
                                  group
                                  min-h-[38px]
                                  cursor-pointer
                                  text-left
                                  ${isSubActive
                                    ? 'bg-brand-accent/15 text-brand-accent font-bold'
                                    : 'text-[#5A6A85] hover:bg-brand-bg hover:text-brand-accent active:bg-brand-bg'
                                  }
                                `}
                              >
                                <div className="w-4 h-4 mr-2.5 flex-shrink-0 flex items-center justify-center">
                                  <SubIcon className={`
                                    w-4 h-4
                                    transition-colors duration-150
                                    ${isSubActive ? 'text-brand-accent' : 'text-[#5A6A85] group-hover:text-brand-accent'}
                                  `} />
                                </div>
                                <span className="flex-1 truncate">
                                  {customizeNavigationLabel(sub.label, uiTextOverrides)}
                                </span>
                                {isSubActive && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand-accent flex-shrink-0" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
export default Sidebar;
