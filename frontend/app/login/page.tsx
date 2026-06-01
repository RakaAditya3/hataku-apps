import { Metadata } from "next";
import { LoginButton } from "./login-button";

export const metadata: Metadata = {
  title: "Login — HATAKU",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-orange-600">HATAKU</h1>
          <p className="text-sm text-muted-foreground">Dimsum HATAKU</p>
          <p className="text-base text-gray-600 font-medium">Pesan, Kumpulkan, Nikmati.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Masuk ke akun</h2>
            <p className="text-sm text-muted-foreground">
              Login untuk mulai pesan dan kumpulkan poin
            </p>
          </div>

          <LoginButton />
        </div>

        <p className="text-xs text-muted-foreground">
          Dengan masuk, kamu setuju dengan syarat & ketentuan HATAKU.
        </p>
      </div>
    </main>
  );
}
