import { LoadingSpinner } from './loading-spinner';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center bg-card/50 backdrop-blur-xl p-10 rounded-3xl border border-border/50 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <LoadingSpinner size="xl" className="mx-auto mb-6 text-primary" />
        <p className="text-muted-foreground font-medium text-lg animate-pulse">{message}</p>
      </div>
    </div>
  );
}
