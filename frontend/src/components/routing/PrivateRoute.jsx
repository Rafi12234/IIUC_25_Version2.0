// ...existing imports...
const { currentUser, loading } = useAuth();

if (loading) return <div>Authenticating...</div>;

return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
