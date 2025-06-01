export type ProductType = {
    id: number;
    name: string;
    email: string;
    count: number;
    hasOptions: boolean;
}

export const defaultProduct: ProductType = {
    id: 0,
    name: "",
    email: "",
    count: 0,
    hasOptions: false
}