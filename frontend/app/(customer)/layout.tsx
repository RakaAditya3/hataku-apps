import { BottomNav } from "@/components/customer/BottomNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream max-w-md mx-auto relative">
      <div className="pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
