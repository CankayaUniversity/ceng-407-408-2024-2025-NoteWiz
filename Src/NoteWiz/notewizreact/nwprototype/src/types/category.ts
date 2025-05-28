export interface Category {
    id: string;
    name: string;
    userId: string;
}

// Yeni kategori oluştururken kullanılacak interface
export interface CategoryData {
    name: string;
    color?: string;
}

// Kategori güncellerken kullanılacak interface
export interface CategoryUpdateData {
    name?: string;
    color?: string;
}

// Renk doğrulama için yardımcı fonksiyon
export const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Varsayılan kategori renkleri
export const DEFAULT_CATEGORY_COLORS = [
    '#FF6B6B', // Kırmızı
    '#4ECDC4', // Turkuaz
    '#45B7D1', // Mavi
    '#96CEB4', // Yeşil
    '#FFEEAD', // Sarı
    '#D4A5A5', // Pembe
    '#9B786F', // Kahverengi
    '#A8A7A7'  // Gri
]; 