import { Link } from 'react-router-dom';

/**
 * NotFoundPage — rendered for all unmatched routes.
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-surface-950 flex-center flex-col gap-6 text-center px-4">
      <div className="text-8xl font-bold gradient-text">404</div>
      <h1 className="text-2xl font-semibold text-surface-100">Page not found</h1>
      <p className="text-surface-400 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="btn-primary mt-2 inline-block"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
