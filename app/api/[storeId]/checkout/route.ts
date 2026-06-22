import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { paystackFetch } from "@/lib/paystack";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: corsHeaders,
  });
}

export const POST = async (
  req: Request,
  { params }: { params: { storeId: string } }
) => {
  const { storeId } = await params;
  const { productIds, email, phone, address } = await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product IDs are required", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const line_items = products.map((product) => ({
    name: product.name,
    amount: Math.round(Number(product.price) * 100),
    quantity: 1,
  }));

  const order = await prismadb.order.create({
    data: {
      storeId: storeId,
      isPaid: false,
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: {
            connect: {
              id: productId,
            },
          },
        })),
      },
    },
  });

  const totalAmount = line_items.reduce(
    (total, item) => total + item.amount,
    0
  );

  const session = await paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: email,
      amount: totalAmount,
      callback_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      metadata: {
        orderId: order.id,
        phone: phone,
        address: address,
        cancel_action: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      },
    }),
  });

  const data = await session.json();

  return NextResponse.json(
    { url: data.data.authorization_url },
    {
      headers: corsHeaders,
    }
  );
};
