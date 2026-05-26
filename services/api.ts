import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// LƯU Ý:
// - Android Emulator: sử dụng 10.0.2.2 để kết nối máy chủ host.
// - iOS Simulator / Web: sử dụng localhost.
// - Thiết bị thật chạy Expo Go: Thay thế bằng IP nội mạng của máy tính bạn (ví dụ: 'http://192.168.1.50:5000')
export const BASE_URL = 'http://192.168.1.45:5000';

export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token bảo mật JWT vào tiêu đề mọi yêu cầu nếu có
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
