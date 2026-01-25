const Loader = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
            />
        </div>
    );
};

export const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <Loader size="xl" />
            <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    </div>
);

export const ProductSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
    </div>
);

export default Loader;
