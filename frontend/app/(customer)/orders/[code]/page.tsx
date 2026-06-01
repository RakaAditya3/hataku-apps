import { OrderDetailClient } from "./OrderDetailClient";

interface OrderPageProps {
  params: Promise<{ code: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { code } = await params;
  return <OrderDetailClient code={code} />;
}
