import { useSharedValue } from 'react-native-reanimated';

export const useSidebar = () => {
  const sidebarActive = useSharedValue(false);

  const toggleSidebar = () => {
    sidebarActive.value = !sidebarActive.value;
  };

  const closeSidebar = () => {
    sidebarActive.value = false;
  };

  const openSidebar = () => {
    sidebarActive.value = true;
  };

  return {
    sidebarActive,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
};