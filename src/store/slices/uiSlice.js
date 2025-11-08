import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobileMenuOpen: false,
  isScrolled: false,
  notifications: [],
  modals: {
    // Add modal states here as needed
  },
  theme: 'light', // or 'dark'
  sidebar: {
    isOpen: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload;
    },
    
    setScrolled: (state, action) => {
      state.isScrolled = action.payload;
    },
    
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(
        notification => notification.id !== notificationId
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    setModalOpen: (state, action) => {
      const { modalName, isOpen } = action.payload;
      state.modals[modalName] = isOpen;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebar.isOpen = action.payload;
    },
  },
});

export const {
  setMobileMenuOpen,
  setScrolled,
  addNotification,
  removeNotification,
  clearNotifications,
  setModalOpen,
  toggleTheme,
  setTheme,
  setSidebarOpen,
} = uiSlice.actions;

// Selectors
export const selectMobileMenuOpen = (state) => state.ui.isMobileMenuOpen;
export const selectScrolled = (state) => state.ui.isScrolled;
export const selectNotifications = (state) => state.ui.notifications;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebar.isOpen;
export const selectModalOpen = (state, modalName) => state.ui.modals[modalName] || false;

export default uiSlice.reducer;
