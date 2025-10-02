export interface IGlobalResponse<T = unknown> {
    status: boolean;
    message: string;
    data?: T;
    pagination?: IPagination;
    error?: IErrorDetail | IErrorDetail[];
}

export interface IPagination {
    total: number;
    current_page: number;
    per_page: number;
    total_page: number;
}

export interface IErrorDetail {
    field?: string;
    message: string;
}

export interface IAdminData {
    id: number;
    username: string;
    email: string;
    name: string;
}

export interface IloginResponse {
    token: string;
    admin: IAdminData;
}

export interface ICounterData {
    id: number;
    name: string;
    currentQueue: number;
    maxQueue: number;
    isActive: boolean;
}

export type TGlobalResponse<T = unknown> = IGlobalResponse<T>;