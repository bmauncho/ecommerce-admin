"use client";

import { useRouter, useParams } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { OrderColumn, columns } from "./column";
import { DataTable } from "@/components/ui/data-table";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      {/* Billboard */}
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders(${data.length})`}
          description="Manage orders for your store"
        />
      </div>
      <Separator />
      {/* Data Table component  */}
      <DataTable searchKey="products" columns={columns} data={data} />
    </>
  );
};
