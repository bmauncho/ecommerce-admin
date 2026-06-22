import prismadb from "@/lib/prismadb";

interface GraphData {
  name: string;
  total: number;
}

export const getDailyGraphRevenue = async (storeId: string) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const dailyRevenue: { [key: number]: number } = {};

  for (const order of paidOrders) {
    const day = order.createdAt.getDate(); // 1–31
    let revenueForOrder = 0;

    for (const item of order.orderItems) {
      revenueForOrder += item.product.price.toNumber();
    }

    dailyRevenue[day] = (dailyRevenue[day] || 0) + revenueForOrder;
  }

  // Build graph data for every day in the month
  const daysInMonth = endDate.getDate();

  const graphData: GraphData[] = [];

  for (let i = 0; i < daysInMonth; i++) {
    const day = i + 1;
    graphData.push({
      name: String(day),
      total: dailyRevenue[day] || 0,
    });
  }

  return graphData;
};
