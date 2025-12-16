import * as LocalAuthentication from 'expo-local-authentication';

export const biometricAuthService = {
  /**
   * Kiểm tra thiết bị có hỗ trợ sinh trắc học không
   */
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  /**
   * Hiển thị màn hình xác thực sinh trắc học
   */
  async authenticate(promptMessage = 'Xác thực để tiếp tục'): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Nhập mã PIN',
      disableDeviceFallback: false,
    });
    return result.success;
  },

  /**
   * Lấy loại sinh trắc học hỗ trợ (FaceID, TouchID, etc.)
   */
  async getSupportedTypes(): Promise<string[]> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'TouchID';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'FaceID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Unknown';
      }
    });
  },
};
