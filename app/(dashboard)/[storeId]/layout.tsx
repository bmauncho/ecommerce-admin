import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayOut({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = await auth.protect();
  const { storeId } = await params;
  // if (!userId) {
  //   redirect("/sign-in");
  // }
  const storeData = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!storeData) {
    redirect("/");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
