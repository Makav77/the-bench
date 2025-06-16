import apiClient from "./apiClient";

export interface ReportDTO {
    id: string;
    reporter: { id: string; firstname: string; lastname: string; };
    reportedUser: { id: string; firstname: string; lastname: string; };
    reportedContentType: string;
    reportedContentId: string;
    createdAt: string;
    reason: string;
    description: string | null;
    status: "PENDING" | "VALIDATED" | "REJECTED";
    treatedBy?: { id: string; firstname: string; lastname: string; };
}

export interface CreateReportPayload {
    reportedUserId: string;
    reason: string;
    reportedContentId: string;
    reportedContentType: string;
    description?: string | null;
}

export interface UpdateReportStatusPayload {
    status: "PENDING" | "VALIDATED" | "REJECTED";
}

export const getReports = async(page = 1, limit = 10): Promise<{ data: ReportDTO[]; total: number; page: number; lastPage: number; }> => {
    const response = await apiClient.get("/reports", { params: { page, limit } });
    return response.data;
}

export const getReport = async(id: string): Promise<ReportDTO> => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
}

export const createReport = async (payload: CreateReportPayload): Promise<ReportDTO> => {
    const response = await apiClient.post("/reports", payload);
    return response.data;
}

export const updateReport = async (reportId: string, payload: UpdateReportStatusPayload): Promise<ReportDTO> => {
    const response = await apiClient.patch(`/reports/${reportId}/status`, payload);
    return response.data;
}

export const removeReport = async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/${id}`);
}
