export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Admin {
    id: string;
    username: string;
    email: string;
    role: 'SuperAdmin' | 'Manager' | 'Editor';
    permissions: string[];
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    discountPrice?: number;
    category: string;
    images: string[];
    tags: string[];
    attributes: { name: string; value: string }[];
    isFeatured: boolean;
    avgRating: number;
    reviewCount: number;
    isActive: boolean;
}

export interface Variant {
    id: string;
    productId: string;
    sku: string;
    size: string;
    color: string;
    priceOverride?: number;
    stockQuantity: number;
    isActive: boolean;
}

export interface CartItem {
    productId: string;
    variantId: string;
    quantity: number;
    addedAt: Date;
}

export interface Cart {
    userId: string;
    items: CartItem[];
    updatedAt: Date;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: {
        productId: string;
        variantId: string;
        name: string;
        sku: string;
        price: number;
        quantity: number;
    }[];
    totalAmount: number;
    discountAmount: number;
    shippingFee: number;
    finalAmount: number;
    shippingAddress: any;
    status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
    paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    trackingId?: string;
    courierPartner?: string;
    createdAt: Date;
    updatedAt: Date;
}
