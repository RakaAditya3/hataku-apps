'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-6 w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center">
        <span className="text-white text-4xl font-bold">H</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">HATAKU Dimsum</h1>

      <div className="my-6">
        <svg
          className="mx-auto mb-4 w-16 h-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M8.464 8.464A5 5 0 0115.54 15.54M3.055 11A9 9 0 1121 12.945"
          />
        </svg>
        <p className="text-gray-500 text-base">Tidak ada koneksi internet</p>
        <p className="text-gray-400 text-sm mt-1">
          Periksa koneksi kamu dan coba lagi
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl active:scale-95 transition-transform"
      >
        Coba Lagi
      </button>
    </div>
  );
}
