export interface SidebarListType {
  name: string;
  icon: string;
  navigate: string;
}

export const sidebarList: SidebarListType[] = [
  {
    name: 'Dashboard',
    icon: 'view-dashboard-outline',
    navigate: 'Dashboard',
  },
  {
    name: 'Dialer',
    icon: 'phone-outline',
    navigate: 'Dialer',
  },
  {
    name: 'Pipeline',
    icon: 'chart-line',
    navigate: 'Pipeline',
  },
  {
    name: 'Leads',
    icon: 'account-group-outline',
    navigate: 'Leads',
  },
  {
    name: 'Tasks',
    icon: 'clipboard-text-outline',
    navigate: 'Tasks',
  },
  {
    name: 'My Profile',
    icon: 'account-circle-outline',
    navigate: 'MyProfile',
  },
  {
    name: 'Settings',
    icon: 'cog-outline',
    navigate: 'Settings',
  },
];