// Haptics utility with fallback for when expo-haptics is not available
// This provides a consistent API whether the package is installed or not

interface HapticsInterface {
  impactAsync: (style: any) => Promise<void>;
  notificationAsync: (type: any) => Promise<void>;
  selectionAsync: () => Promise<void>;
  ImpactFeedbackStyle: {
    Light: 'light';
    Medium: 'medium';
    Heavy: 'heavy';
  };
  NotificationFeedbackType: {
    Success: 'success';
    Warning: 'warning';
    Error: 'error';
  };
}

let Haptics: HapticsInterface;

try {
  // Try to import expo-haptics if available
  const ExpoHaptics = require('expo-haptics');
  Haptics = ExpoHaptics;
} catch (e) {
  // Fallback implementation (no-op)
  console.log('expo-haptics not available, using fallback');
  Haptics = {
    impactAsync: async () => {},
    notificationAsync: async () => {},
    selectionAsync: async () => {},
    ImpactFeedbackStyle: {
      Light: 'light',
      Medium: 'medium',
      Heavy: 'heavy',
    },
    NotificationFeedbackType: {
      Success: 'success',
      Warning: 'warning',
      Error: 'error',
    },
  };
}

export default Haptics;
export const { ImpactFeedbackStyle, NotificationFeedbackType } = Haptics;
export const { impactAsync, notificationAsync, selectionAsync } = Haptics;
