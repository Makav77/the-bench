export interface GalleryFormData {
    id: string;
    url: string;
    description?: string;
    author: { id: string; firstname: string; lastname: string };
    likesCount: number;
    createdAt: string;
}
