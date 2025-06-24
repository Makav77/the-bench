import apiClient from "./apiClient";

export interface CommentDTO {
    id: string;
    newsId: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    likedBy: string[];
    totalLikes: number;
}

export interface CreateCommentDTO {
    newsId: string;
    content: string;
}

export interface UpdateCommentDTO {
    content: string;
}

export interface CommentLikeDTO {
    liked: boolean;
    totalLikes: number;
}

export const getComments = async (newsId: string): Promise<CommentDTO[]> => {
    const response = await apiClient.get(`/news/${newsId}/comments`);
    return response.data;
};

export const createComment = async (newsId: string, content: string): Promise<CommentDTO> => {
    const response = await apiClient.post(`/news/${newsId}/comments`, { content });
    return response.data;
};

export const updateComment = async (newsId: string, commentId: string, content: string): Promise<CommentDTO> => {
    const response = await apiClient.patch(`/news/${newsId}/comments/${commentId}`, { content });
    return response.data;
};

export const deleteComment = async (newsId: string, commentId: string): Promise<{ deleted: boolean }> => {
    const response = await apiClient.delete(`/news/${newsId}/comments/${commentId}`);
    return response.data;
};

export const toggleCommentLike = async (newsId: string, commentId: string): Promise<CommentLikeDTO> => {
    const response = await apiClient.post(`/news/${newsId}/comments/${commentId}/like`);
    return response.data;
};
