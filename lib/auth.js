import cookie from 'cookie';

/**
 * Helper to protect admin pages.  If the `admin_token` cookie is not present
 * it returns a redirect object to the login page.  Otherwise it returns
 * an empty props object.  You can extend this to validate the token or
 * attach user info.
 *
 * @param {Object} ctx The Next.js context
 */
export function requireAdmin(ctx) {
  const { req } = ctx;
  const cookies = cookie.parse(req?.headers?.cookie || '');
  const token = cookies.admin_token;
  if (!token) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  return { props: {} };
}