import { WorkspacePage } from '@/components/layout/workspace-page';

export default function CvReviewPage() {
  return (
    <WorkspacePage
      role="student"
      title="CV and Portfolio Review"
      subtitle="Upload or paste CV/JD, add portfolio/GitHub URLs and receive AI fit analysis."
      highlights={['Overall score and missing keywords', 'Better bullet points', 'Recommended tutoring package and roadmap items']}
    />
  );
}
