import { create } from "zustand";





export const useShareStore = create((set, get) => ({
    dummyShares: [
        {
            id:1,
            shareName: "Alpha Corp",
            quantityAvailable: "1200",
            price: "45.50",
            deliveryTimeline: "T",
            confirmDelivery: true,
            shareInStock: true,
            preShareTransfer: false,
            moq:"1000",
            fixed:true,
        },
        {
            id:2,
            shareName: "Beta Holdings",
            quantityAvailable: "800",
            price: "38.20",
            deliveryTimeline: "T+1",
            confirmDelivery: false,
            shareInStock: true,
            preShareTransfer: true,
            moq:"1200",
            fixed:false,
        },
        {
            id:3,
            shareName: "Gamma Investments",
            quantityAvailable: "1500",
            price: "52.00",
            deliveryTimeline: "T",
            confirmDelivery: true,
            shareInStock: false,
            preShareTransfer: false,
            moq:"1030",
            fixed:true,
        },
        {
            id:4,
            shareName: "Delta Ventures",
            quantityAvailable: "600",
            price: "27.75",
            deliveryTimeline: "T+2",
            confirmDelivery: false,
            shareInStock: true,
            preShareTransfer: false,
            moq:"1500",
            fixed:false,
        },
        {
            id:5,
            shareName: "Epsilon Partners",
            quantityAvailable: "2000",
            price: "61.40",
            deliveryTimeline: "T+1",
            confirmDelivery: true,
            shareInStock: true,
            preShareTransfer: true,
            moq:"1000",
            fixed:false,
        },
    ],
    dummyBids:[
    { stockId: 1, userId: "user1", amount: 150, quantity: 10, count: 1 },
    { stockId: 1, userId: "user2", amount: 155, quantity: 5, count: 1 },
    { stockId: 1, userId: "user3", amount: 148, quantity: 20, count: 1 },

    { stockId: 2, userId: "user1", amount: 200, quantity: 8, count: 1 },
    { stockId: 2, userId: "user4", amount: 210, quantity: 12, count: 1 },
    { stockId: 2, userId: "user5", amount: 205, quantity: 15, count: 1 },

    { stockId: 3, userId: "user2", amount: 75, quantity: 30, count: 1 },
    { stockId: 3, userId: "user3", amount: 80, quantity: 25, count: 1 },

    { stockId: 4, userId: "user1", amount: 500, quantity: 2, count: 1 },
    { stockId: 4, userId: "user5", amount: 510, quantity: 1, count: 1 },

    { stockId: 5, userId: "user2", amount: 1200, quantity: 3, count: 1 },
    { stockId: 5, userId: "user4", amount: 1180, quantity: 5, count: 1 },
],

}))