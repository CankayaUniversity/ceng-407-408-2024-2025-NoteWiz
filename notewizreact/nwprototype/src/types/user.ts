// src/types/user.ts
export interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName: string;
}