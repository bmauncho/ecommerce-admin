import { headers } from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const headers_ = await headers();
  const signature = headers_.get("x-paystack-signature") as string;

  let event: any;
  let isVerified: any;

  try {
    isVerified = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (isVerified !== signature) {
      return new NextResponse("[WEBHOOK_ERROR]: Invalid signature", {
        status: 400,
      });
    }

    event = JSON.parse(body);
  } catch (error) {
    return new NextResponse(`[WEBHOOK_ERROR] :${(error as Error).message}`, {
      status: 400,
    });
  }

  if (event.event === "charge.success") {
    const order = await prismadb.order.update({
      where: {
        id: event.data.metadata.orderId,
      },
      data: {
        isPaid: true,
        // TODO: Add other fields as needed
        phone: event.data.metadata.phone,
        address: event.data.metadata.address,
      },
      include: {
        orderItems: true,
      },
    });

    const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    await prismadb.product.updateMany({
      where: {
        id: {
          in: [...productIds],
        },
      },
      data: {
        isArchived: true,
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
