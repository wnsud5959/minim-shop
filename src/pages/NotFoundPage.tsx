import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { EmptyState } from '@/components/ui/Feedback';
import { SearchEmptyIcon } from '@/components/ui/icons';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="container-page">
        <EmptyState
          icon={<SearchEmptyIcon />}
          message="요청하신 페이지를 찾을 수 없습니다"
          actionLabel="홈으로"
          onAction={() => navigate('/')}
          className="py-24"
        />
      </div>
    </Layout>
  );
}
