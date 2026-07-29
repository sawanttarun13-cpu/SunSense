import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-slate-400">
      <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
