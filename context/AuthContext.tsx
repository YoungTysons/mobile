import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  ho_ten: string;
  so_dien_thoai?: string;
  vai_tro: string;
  la_admin: boolean;
  anh_dai_dien?: string;
  dia_chi?: string;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        const storedToken = await AsyncStorage.getItem('token');

        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu lưu trữ phiên đăng nhập:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (userData: User, userToken: string) => {
    try {
      setCurrentUser(userData);
      setToken(userToken);
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      await AsyncStorage.setItem('token', userToken);
    } catch (err) {
      console.error('Lỗi khi lưu thông tin đăng nhập:', err);
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      setToken(null);
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('token');
    } catch (err) {
      console.error('Lỗi khi xóa thông tin đăng nhập:', err);
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    try {
      const nextUser = { ...currentUser, ...updatedData };
      setCurrentUser(nextUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(nextUser));
    } catch (err) {
      console.error('Lỗi cập nhật thông tin cá nhân:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
