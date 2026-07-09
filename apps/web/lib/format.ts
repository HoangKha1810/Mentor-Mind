const statusLabels: Record<string, string> = {
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm khóa',
  PENDING_VERIFICATION: 'Chờ xác minh',
  REQUESTED: 'Đã gửi yêu cầu',
  CONTACTED: 'Đã liên hệ',
  SCHEDULED: 'Đã lên lịch',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  DRAFT_AI: 'Bản nháp AI',
  PENDING_ADMIN_REVIEW: 'Chờ admin duyệt',
  NEEDS_STUDENT_INFO: 'Cần bổ sung thông tin',
  COMPLETED: 'Hoàn tất',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  RESCHEDULED: 'Đổi lịch',
  NO_SHOW: 'Vắng mặt',
  IN_PROGRESS: 'Đang xử lý',
  OPEN: 'Đang mở',
  RESOLVED: 'Đã xử lý',
  CLOSED: 'Đã đóng',
  LOW: 'Thấp',
  MEDIUM: 'Vừa',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
  EASY: 'Dễ',
  HARD: 'Khó',
  ACCEPTED: 'Đúng',
  WRONG_ANSWER: 'Sai kết quả',
  TIME_LIMIT_EXCEEDED: 'Quá thời gian',
  RUNTIME_ERROR: 'Lỗi chạy',
  COMPILATION_ERROR: 'Lỗi biên dịch',
  INTERNAL_ERROR: 'Lỗi hệ thống',
  TECHNICAL: 'Kỹ thuật',
  BEHAVIORAL: 'Hành vi',
  HR: 'Nhân sự',
  PROJECT_DEFENSE: 'Bảo vệ dự án',
  ENGLISH: 'Tiếng Anh',
  MIXED: 'Tổng hợp',
  STUDENT: 'Học viên',
  MENTOR: 'Mentor',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super admin',
};

export function formatStatus(value?: string | null) {
  if (!value) return 'Chưa có trạng thái';
  return statusLabels[value] ?? value.replaceAll('_', ' ').toLowerCase();
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return 'Chưa có thời gian';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export function formatDate(value?: string | Date | null) {
  if (!value) return 'Chưa có ngày';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function toDateTimeLocalValue(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
