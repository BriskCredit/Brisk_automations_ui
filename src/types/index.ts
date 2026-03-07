// ============================================
// Report Types
// ============================================
export interface ReportTypeResponse {
    id: number;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface ReportTypeCreate {
    code: string;
    name: string;
    description?: string;
}

export interface ReportTypeUpdate {
    name?: string;
    description?: string;
    is_active?: boolean;
}

// ============================================
// Recipients
// ============================================
export interface RecipientResponse {
    id: number;
    email: string;
    name: string | null;
    report_type_id: number;
    report_type_code: string | null;
    is_active: boolean;
    is_cc: boolean;
    is_bcc: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface RecipientCreate {
    email: string;
    report_type_code: string;
    name?: string;
    is_cc?: boolean;
    is_bcc?: boolean;
}

export interface RecipientUpdate {
    email?: string;
    name?: string;
    is_cc?: boolean;
    is_bcc?: boolean;
    is_active?: boolean;
}

// ============================================
// Files
// ============================================
export interface FileResponse {
    id: number;
    filename: string;
    file_path: string;
    file_url: string;
    file_size: number | null;
    mime_type: string | null;
    report_type_id: number | null;
    report_date: string | null;
    created_at: string | null;
}

// ============================================
// Report Status & Operations
// ============================================
export interface StatusResponse {
    report_type_code: string;
    report_type_name: string;
    is_active: boolean;
    recipient_count: number;
    recipients: Array<{ email: string; type: 'to' | 'cc' | 'bcc' }>;
}

export interface PreviewResponse {
    success: boolean;
    generated_at: string;
    row_count: number;
    columns: string[];
    summary: Record<string, unknown>[];
}

export interface RunResponse {
    success: boolean;
    message: string;
    rows: number | null;
    file_path: string | null;
}

export interface RunRequest {
    override_recipients?: string[];
}

// ============================================
// API Response Types
// ============================================
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface PaginationParams {
    page?: number;
    page_size?: number;
}

export interface DeleteResponse {
    message: string;
    success: boolean;
}

export interface ApiError {
    detail: string;
}

// ============================================
// Jobs
// ============================================
export type JobStatus = 'draft' | 'published' | 'closed';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';

export interface JobResponse {
    id: number;
    title: string;
    summary: string | null;
    responsibilities: string | null;
    requirements: string | null;
    qualifications: string | null;
    benefits: string | null;
    notes: string | null;
    custom_instructions: string | null;
    status: JobStatus;
    location: string | null;
    department: string | null;
    employment_type: string | null;
    created_at: string;
    updated_at: string | null;
    published_at: string | null;
    closed_at: string | null;
    expires_at: string | null;
    is_expired: boolean;
    application_count: number;
}

export interface JobCreate {
    title: string;
    summary?: string;
    responsibilities?: string;
    requirements?: string;
    qualifications?: string;
    benefits?: string;
    notes?: string;
    custom_instructions?: string;
    location?: string;
    department?: string;
    employment_type?: EmploymentType;
    expires_at?: string;
    publish?: boolean;
}

export interface JobUpdate {
    title?: string;
    summary?: string;
    responsibilities?: string;
    requirements?: string;
    qualifications?: string;
    benefits?: string;
    notes?: string;
    custom_instructions?: string;
    location?: string;
    department?: string;
    employment_type?: EmploymentType;
    expires_at?: string;
}

// ============================================
// Applications
// ============================================
export type ApplicationStatus =
    | 'submitted'
    | 'reviewed'
    | 'shortlisted'
    | 'contacted'
    | 'rejected'
    | 'hired';

export type AIAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ApplicationResponse {
    id: number;
    job_id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    cover_letter: string | null;
    resume_filename: string | null;
    resume_url: string | null;
    ai_score: number | null;
    ai_comments: string | null;
    ai_analysis_status: AIAnalysisStatus;
    ai_analysis_error: string | null;
    status: ApplicationStatus;
    admin_notes: string | null;
    created_at: string;
    updated_at: string | null;
    reviewed_at: string | null;
}

export interface ApplicationStatusUpdate {
    status: ApplicationStatus;
    admin_notes?: string;
}

export interface ApplicationStats {
    total_applications: number;
    by_status: Record<ApplicationStatus, number>;
    by_analysis_status: Record<AIAnalysisStatus, number>;
    average_score: number | null;
}

export interface BulkRejectRequest {
    admin_notes?: string;
}

export interface BulkRejectResponse {
    success: boolean;
    rejected_count: number;
    message: string;
}

// ============================================
// Authentication Types
// ============================================
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    invite_code: string;
}

export interface RefreshRequest {
    refresh_token: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface UserResponse {
    id: number;
    email: string;
    name: string | null;
    is_active: boolean;
    created_at: string;
}

export interface ValidateInviteResponse {
    valid: boolean;
    message: string;
}

export interface CreateInviteRequest {
    invitee_email: string;
    inviter_ip?: string;
    inviter_user_agent?: string;
}

export interface InviteResponse {
    id: number;
    code: string;
    invitee_email: string | null;
    is_used: boolean;
    created_at: string;
    expires_at: string;
    used_at: string | null;
}

export interface AuthErrorResponse {
    detail: string;
}
