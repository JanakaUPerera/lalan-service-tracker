export interface User {
    id: number;
    name: string;
    email: string;
}

export interface ApiResource<T> {
    data: T
}

export interface LoginCredentials {
    email: string;
    password: string;
}