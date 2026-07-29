import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({ 
  message = 'Something went wrong while loading data.', 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-slate-500 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to load</h3>
      <p className="text-sm mb-6 max-w-md">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium text-slate-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
