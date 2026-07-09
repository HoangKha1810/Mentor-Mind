import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewCodeProblemPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Tạo bài code"
      subtitle="Soạn bài luyện code mới với ví dụ, ràng buộc, bộ test chấm điểm và giải thích lời giải."
      highlights={[
        'Đề bài và định dạng input/output',
        'Starter code theo ngôn ngữ',
        'Giới hạn thời gian/bộ nhớ',
      ]}
    />
  );
}
