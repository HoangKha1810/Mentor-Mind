import { WorkspacePage } from '@/components/layout/workspace-page';

export default function EditCodeProblemPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Sửa bài code"
      subtitle="Cập nhật nội dung bài, tag, test case và trạng thái xuất bản."
      highlights={[
        'Không lộ test ẩn',
        'Giải thích lời giải chỉ dành cho admin',
        'Trạng thái nháp/đã xuất bản/lưu trữ',
      ]}
    />
  );
}
