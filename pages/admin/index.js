import { requireAdmin } from '../../lib/auth';

export const getServerSideProps = async (ctx) => {
  const result = requireAdmin(ctx);
  if (result.redirect) {
    return result;
  }
  return {
    redirect: {
      destination: '/admin/dashboard',
      permanent: false,
    },
  };
};

export default function AdminIndex() {
  return null;
}