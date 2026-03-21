export type ProductType = {
    id: number;
    name: string;
    email: string;
    count: number;
    hasOptions: number;
}

export const defaultProduct: ProductType = {
    id: 0,
    name: "",
    email: "",
    count: 0,
    hasOptions: 0
}

export type DiscountType = {
    discountId: number;
    discountName: string;
    discount: string;
    threshold: string;
}