import { Badge } from "src/modules/Shop/entities/badge.entity";

export interface ProfileSummaryDTO {
    id: string;
    firstname: string;
    lastname: string;
    profilePictureUrl: string;
    points: number;
    events: {
        id: string;
        name: string;
        startDate: Date;
    }[];

    challenges: {
        id: string;
        title: string;
        startDate: Date;
    }[];

    marketItems: {
        id: string;
        title: string;
        updatedAt: Date;
        images: string[];
    }[];

    badges: {
        id: string;
        imageUrl: string;
        cost: number;
        available: boolean;
    }[];

    isFriend?: boolean;
    requestSent?: boolean;
    requestReceived?: boolean; 
}
