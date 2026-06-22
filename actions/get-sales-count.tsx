import prismadb from "@/lib/prismadb";

export const getSalesCount = async (storeId: string) => {
  const paidOrders = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
    },
  });
  return paidOrders;
};

export const getDailySalesCount = async (storeId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const dailySales = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return dailySales;
};
