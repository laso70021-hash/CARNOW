import Link from "next/link";
import { Car, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-6 shadow-sm">
        <Car className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold text-red-600 tracking-wider uppercase mb-2">404 Error</span>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Vehicle or Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        The vehicle listing or page you are looking for may have been sold, removed, or the link might be broken.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-red-600/20"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Homepage
      </Link>
    </div>
  );
}
