export interface ProfileSummaryDTO {
    id: string;
    firstname: string;
    lastname: string;
    profilePictureUrl: string;
    badges: string[];
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

    isFriend?: boolean;
    requestSent?: boolean;
    requestReceived?: boolean; 
}
