import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold gradient-text">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
                <p className="text-gray-600 mt-2 mb-8">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/" className="btn-primary">
                        Go Home
                    </Link>
                    <Link to="/products" className="btn-secondary">
                        Browse Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
