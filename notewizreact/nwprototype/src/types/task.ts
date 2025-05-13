export interface Task {
    id: string;
    description: string;
    isCompleted: boolean;
    dueDate: Date;
    userId: string;
    reminder?: Date;
    priority: 'low' | 'medium' | 'high'; // API'de 1,2,3 olarak geliyor, frontend'de string kullanacağız
    createdAt: Date;
    completedAt?: Date;
}

// API'ye gönderilecek task verisi için interface
export interface TaskData {
    description: string;
    dueDate: Date;
    priority?: 'low' | 'medium' | 'high';
    reminder?: Date;
    isCompleted?: boolean;
}

// Priority değerlerini API ile eşleştirmek için yardımcı enum
export enum TaskPriority {
    Low = 1,
    Medium = 2,
    High = 3
}

// Priority dönüşümleri için yardımcı fonksiyonlar
export const priorityToString = (priority: number): 'low' | 'medium' | 'high' => {
    switch (priority) {
        case 1: return 'low';
        case 2: return 'medium';
        case 3: return 'high';
        default: return 'medium';
    }
};

export const priorityToNumber = (priority: 'low' | 'medium' | 'high'): number => {
    switch (priority) {
        case 'low': return 1;
        case 'medium': return 2;
        case 'high': return 3;
        default: return 2;
    }
}; 