import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  useColorScheme,
  Platform,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import api from '../../services/api';
import { useRouter, useFocusEffect } from 'expo-router';

interface Product {
  id: number;
  ten_san_pham: string;
  ma_sku: string;
  id_danh_muc: number | null;
  category?: string;
  gia_ban: number;
  gia_cu: number | null;
  gia_nhap: number;
  so_luong_kho: number;
  so_luong_toi_thieu: number;
  trang_thai: string;
  mo_ta: string;
  chat_lieu_chau: string | null;
  don_vi: string;
  nhan_san_pham: string | null;
  anh_bia: string | null;
}

interface Category {
  id: number;
  ten_danh_muc: string;
}

export default function AdminProductsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [ten_san_pham, setTenSanPham] = useState('');
  const [ma_sku, setMaSku] = useState('');
  const [id_danh_muc, setIdDanhMuc] = useState<string>('');
  const [gia_ban, setGiaBan] = useState('');
  const [gia_cu, setGiaCu] = useState('');
  const [gia_nhap, setGiaNhap] = useState('');
  const [so_luong_kho, setSoLuongKho] = useState('');
  const [so_luong_toi_thieu, setSoLuongToiThieu] = useState('');
  const [trang_thai, setTrangThai] = useState('Đang bán');
  const [don_vi, setDonVi] = useState('Chậu');
  const [chat_lieu_chau, setChatLieuChau] = useState('');
  const [nhan_san_pham, setNhanSanPham] = useState('');
  const [mo_ta, setMoTa] = useState('');
  const [anh_bia, setAnhBia] = useState('');

  const loadData = async () => {
    try {
      // 1. Tải danh sách sản phẩm (kèm ẩn/hết hàng cho Admin)
      const prodRes = await api.get('/san-pham?admin=1');
      setProducts(prodRes.data || []);

      // 2. Tải danh mục thực tế
      const catRes = await api.get('/danh-muc').catch(() => null);
      if (catRes && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu sản phẩm:', err);
      Alert.alert('Lỗi', 'Không thể kết nối với máy chủ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTenSanPham('');
    setMaSku('');
    setIdDanhMuc(categories[0]?.id.toString() || '');
    setGiaBan('');
    setGiaCu('');
    setGiaNhap('');
    setSoLuongKho('10');
    setSoLuongToiThieu('5');
    setTrangThai('Đang bán');
    setDonVi('Chậu');
    setChatLieuChau('Đất nung');
    setNhanSanPham('');
    setMoTa('');
    setAnhBia('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setTenSanPham(prod.ten_san_pham);
    setMaSku(prod.ma_sku);
    setIdDanhMuc(prod.id_danh_muc?.toString() || '');
    setGiaBan(prod.gia_ban.toString());
    setGiaCu(prod.gia_cu?.toString() || '');
    setGiaNhap(prod.gia_nhap.toString());
    setSoLuongKho(prod.so_luong_kho.toString());
    setSoLuongToiThieu(prod.so_luong_toi_thieu.toString());
    setTrangThai(prod.trang_thai);
    setDonVi(prod.don_vi);
    setChatLieuChau(prod.chat_lieu_chau || '');
    setNhanSanPham(prod.nhan_san_pham || '');
    setMoTa(prod.mo_ta || '');
    setAnhBia(prod.anh_bia || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!ten_san_pham.trim() || !gia_ban) {
      Alert.alert('Cảnh báo', 'Tên sản phẩm và Giá bán là bắt buộc!');
      return;
    }

    const payload = {
      ten_san_pham,
      ma_sku: ma_sku.trim() || undefined,
      id_danh_muc: id_danh_muc ? parseInt(id_danh_muc) : null,
      gia_ban: Number(gia_ban),
      gia_cu: gia_cu ? Number(gia_cu) : null,
      gia_nhap: Number(gia_nhap) || 0,
      so_luong_kho: parseInt(so_luong_kho) || 0,
      so_luong_toi_thieu: parseInt(so_luong_toi_thieu) || 5,
      trang_thai,
      don_vi,
      chat_lieu_chau: chat_lieu_chau || null,
      nhan_san_pham: nhan_san_pham || null,
      mo_ta,
      anh_bia: anh_bia.trim() || null,
    };

    setLoading(true);
    try {
      if (editingProduct) {
        // Edit Product
        await api.put(`/san-pham/${editingProduct.id}`, payload);
        Alert.alert('Thành công', `Đã cập nhật sản phẩm "${ten_san_pham}" thành công!`);
      } else {
        // Add Product
        await api.post('/san-pham', payload);
        Alert.alert('Thành công', `Đã thêm sản phẩm "${ten_san_pham}" thành công!`);
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      console.error('Lỗi lưu sản phẩm:', err);
      Alert.alert('Thất bại', err.response?.data?.error || 'Lỗi lưu sản phẩm');
      setLoading(false);
    }
  };

  const handleDelete = (prod: Product) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn chắc chắn muốn xóa vĩnh viễn cây "${prod.ten_san_pham}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete(`/san-pham/${prod.id}`);
              Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi cơ sở dữ liệu!');
              loadData();
            } catch (err) {
              console.error('Lỗi xóa sản phẩm:', err);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm này.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.ten_san_pham.toLowerCase().includes(query) ||
      p.ma_sku.toLowerCase().includes(query)
    );
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Đang bán':
        return { text: '#10b981', bg: '#ecfdf5' };
      case 'Ẩn':
        return { text: '#6b7280', bg: '#f3f4f6' };
      case 'Hết hàng':
        return { text: '#ef4444', bg: '#fef2f2' };
      default:
        return { text: '#f59e0b', bg: '#fef3c7' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#faf9f6' }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quản lý sản phẩm</Text>
        <TouchableOpacity onPress={handleOpenAddModal} style={styles.addBtn}>
          <Ionicons name="add-circle" size={28} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Thanh tìm kiếm */}
      <View style={[styles.searchBar, { backgroundColor: colors.backgroundElement }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Tìm tên cây hoặc mã SKU..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách */}
      {loading && products.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        >
          {filteredProducts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không tìm thấy sản phẩm nào.</Text>
          ) : (
            filteredProducts.map(item => {
              const status = getStatusStyle(item.trang_thai);
              return (
                <View key={item.id} style={[styles.card, { backgroundColor: colors.backgroundElement }]}>
                  {/* Thumbnail */}
                  <Image
                    source={{ uri: item.anh_bia || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=200' }}
                    style={styles.thumbnail}
                  />

                  {/* Info */}
                  <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                      {item.ten_san_pham}
                    </Text>
                    <Text style={[styles.sku, { color: colors.textSecondary }]}>SKU: {item.ma_sku}</Text>
                    
                    <View style={styles.priceRow}>
                      <Text style={styles.priceBan}>{item.gia_ban?.toLocaleString()}đ</Text>
                      <Text style={[styles.priceNhap, { color: colors.textSecondary }]}>
                        (G.nhập: {item.gia_nhap?.toLocaleString()}đ)
                      </Text>
                    </View>

                    <View style={styles.stockRow}>
                      <Text style={[styles.stockText, { color: colors.textSecondary }]}>
                        Kho: <Text style={{ fontWeight: 'bold', color: item.so_luong_kho <= item.so_luong_toi_thieu ? '#ef4444' : colors.text }}>{item.so_luong_kho}</Text> / {item.don_vi}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.badgeText, { color: status.text }]}>{item.trang_thai}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleOpenEditModal(item)} style={styles.actionIconBtn}>
                      <Ionicons name="create-outline" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionIconBtn}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* FORM MODAL (THÊM / SỬA) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
              {/* Tên sản phẩm */}
              <Text style={[styles.label, { color: colors.text }]}>Tên sản phẩm *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                value={ten_san_pham}
                onChangeText={setTenSanPham}
                placeholder="Nhập tên cây cảnh..."
                placeholderTextColor={colors.textSecondary}
              />

              {/* SKU */}
              <Text style={[styles.label, { color: colors.text }]}>Mã SKU (tự động tạo nếu bỏ trống)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                value={ma_sku}
                onChangeText={setMaSku}
                placeholder="Ví dụ: SD-TH-01"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Danh mục */}
              <Text style={[styles.label, { color: colors.text }]}>Danh mục</Text>
              <View style={styles.categoriesWrap}>
                {categories.map(cat => {
                  const isSelected = id_danh_muc === cat.id.toString();
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setIdDanhMuc(cat.id.toString())}
                      style={[
                        styles.catChoiceBtn,
                        {
                          borderColor: isSelected ? '#10b981' : isDark ? '#333' : '#cbd5e1',
                          backgroundColor: isSelected ? '#ecfdf5' : 'transparent',
                        },
                      ]}
                    >
                      <Text style={{ color: isSelected ? '#10b981' : colors.text, fontSize: 13, fontWeight: '600' }}>
                        {cat.ten_danh_muc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Hàng Giá bán / Giá nhập */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Giá bán *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                    keyboardType="numeric"
                    value={gia_ban}
                    onChangeText={setGiaBan}
                    placeholder="250000"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Giá nhập</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                    keyboardType="numeric"
                    value={gia_nhap}
                    onChangeText={setGiaNhap}
                    placeholder="150000"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              {/* Hàng tồn kho */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Tồn kho</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                    keyboardType="numeric"
                    value={so_luong_kho}
                    onChangeText={setSoLuongKho}
                    placeholder="10"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Tối thiểu</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                    keyboardType="numeric"
                    value={so_luong_toi_thieu}
                    onChangeText={setSoLuongToiThieu}
                    placeholder="5"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              {/* Đơn vị & Chất liệu */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Đơn vị</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                    value={don_vi}
                    onChangeText={setDonVi}
                    placeholder="Chậu, Bịch, Cây..."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Chất liệu chậu</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                    value={chat_lieu_chau}
                    onChangeText={setChatLieuChau}
                    placeholder="Đất nung, Nhựa..."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              {/* Trạng thái */}
              <Text style={[styles.label, { color: colors.text }]}>Trạng thái kinh doanh</Text>
              <View style={styles.formRow}>
                {['Đang bán', 'Hết hàng', 'Ẩn'].map(st => {
                  const isStSelected = trang_thai === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setTrangThai(st)}
                      style={[
                        styles.stChoiceBtn,
                        {
                          borderColor: isStSelected ? '#10b981' : isDark ? '#333' : '#cbd5e1',
                          backgroundColor: isStSelected ? '#ecfdf5' : 'transparent',
                          flex: 1,
                          marginHorizontal: 2,
                        },
                      ]}
                    >
                      <Text style={{ color: isStSelected ? '#10b981' : colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Ảnh bìa */}
              <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>Đường dẫn ảnh bìa (URL)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0' }]}
                value={anh_bia}
                onChangeText={setAnhBia}
                placeholder="https://example.com/plant.jpg"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Mô tả */}
              <Text style={[styles.label, { color: colors.text }]}>Mô tả sản phẩm</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: isDark ? '#333' : '#e2e8f0', height: 80 }]}
                multiline={true}
                value={mo_ta}
                onChangeText={setMoTa}
                placeholder="Viết vài dòng mô tả đặc tính, cách chăm sóc cây..."
                placeholderTextColor={colors.textSecondary}
              />

              {/* Save Button */}
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Lưu sản phẩm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  addBtn: {
    padding: 4,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  // Loading
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },

  // Card
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  sku: {
    fontSize: 11,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  priceBan: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
  },
  priceNhap: {
    fontSize: 11,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'column',
    gap: 8,
    paddingLeft: 12,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  form: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  catChoiceBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  stChoiceBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
