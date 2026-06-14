"use client";

import * as z from "zod";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Category,
  Color,
  Product,
  Size,
} from "@/lib/generated/prismadb/client";
import ImageUpload from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1, "Price is required"),
  categoryId: z.string().min(1, "Category is required"),
  colorId: z.string().min(1, "Color is required"),
  sizeId: z.string().min(1, "Size is required"),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData:
    | (Omit<Product, "price"> & {
        price: number;           // ← override Decimal with number
        images: { url: string }[];
      })
    | null;
  categories: Category[];
  sizes: Size[];
  colors: Color[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  sizes,
  colors,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product" : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialData
      ? {
          ...initialData,
          price: parseFloat(String(initialData?.price)),
        }
      : {
          name: "",
          images: [],
          price: 0,
          categoryId: "",
          sizeId: "",
          colorId: "",
          isFeatured: false,
          isArchived: false,
        },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }

      router.refresh();

      router.push(`/${params.storeId}/products`);

      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);

      router.refresh();

      router.push(`/${params.storeId}/products`);

      toast.success("Product deleted.");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          {/* ----- Products Field ----- */}
          <FieldGroup>
            <Controller
              name="images"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Images</FieldLabel>
                  <ImageUpload
                    value={(field.value || []).map((image) => image.url)}
                    disabled={loading}
                    onChange={(url: string) => {
                      const current = form.getValues("images") || [];

                      const updated = [...current, { url }];

                      console.log("Before:", current);
                      console.log("Added:", url);

                      field.onChange(updated);
                    }}
                    onRemove={(url) => {
                      const current = form.getValues("images") || [];

                      const updated = current.filter(
                        (image) => image.url !== url
                      );

                      field.onChange(updated);
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          {/* ----- Image URL Field ----- */}
          <div className="grid grid-cols-3 gap-8">
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Product name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {/* price */}
            <FieldGroup>
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Price</FieldLabel>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {/* Category Field */}
            <FieldGroup>
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {/* Size Field */}
            <FieldGroup>
              <Controller
                name="sizeId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Size</FieldLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a size"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sizes.map((size) => (
                            <SelectItem key={size.id} value={size.id}>
                              {size.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {/* Color Field */}
            <FieldGroup>
              <Controller
                name="colorId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Color</FieldLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a color"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {colors.map((color) => (
                            <SelectItem key={color.id} value={color.id}>
                              {color.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {/* Featured */}
            <FieldGroup>
              <Controller
                name="isFeatured"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation={"horizontal"}
                    className="flex flex-row space-x-3 space-y-0 items-start rounded-md border p-4"
                  >
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="shrink-0 mt-1"
                    />
                    <div className="space-y-1 leading-none">
                      <FieldLabel>Featured</FieldLabel>
                      <FieldDescription>
                        This product will appear on the home page.
                      </FieldDescription>
                    </div>

                    {fieldState.invalid && (
                      <div className="shrink-0">
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            {/* Archived */}
            <FieldGroup>
              <Controller
                name="isArchived"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation={"horizontal"}
                    className="flex flex-row space-x-3 space-y-0 items-start rounded-md border p-4"
                  >
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="shrink-0 mt-1"
                    />
                    <div className="space-y-1 leading-none">
                      <FieldLabel>Archived</FieldLabel>
                      <FieldDescription>
                        This product will not appear anywhere on the store.
                      </FieldDescription>
                    </div>

                    {fieldState.invalid && (
                      <div className="shrink-0">
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </div>
    </>
  );
};
