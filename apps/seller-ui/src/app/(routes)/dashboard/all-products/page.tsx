"use client";

import React, { useMemo, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";

import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";

import {
    useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import Image from "next/image";
import Link from "next/link";
import { DeleteConfirmationModel } from "apps/seller-ui/src/shared/components/modals/delete.confirmation.model";

const fetchProducts = async () => {
  const res = await axiosInstance.get(
    "/product/api/get-shop-products"
  );

  return res?.data?.products;
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  const [analyticsData, setAnalyticsData] =
    useState(null);

  const [showAnalytics, setShowAnalytics] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<any>(null);

  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  const deleteProduct = async (productId: string) => {
    await axiosInstance.delete(
      `/product/api/delete-product/${productId}`
    );
  }

    const restoreProduct = async (productId: string) => {
        await axiosInstance.put(
            `/product/api/restore-product/${productId}`
        );
    }


  //Delete product Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
            setShowDeleteModal(false);
        }
    });

    //Restore product Mutatuion
    const restoreMutation = useMutation({
        mutationFn: restoreProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
            setShowDeleteModal(false);
        }
    });

  const openDeleteModel = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "images",

        header: "Image",

        cell: ({ row }: any) => {
            console.log("Row Data:", row.original); // Debugging log to check the structure of row.original
          const imageUrl = row.original.images?.[0]?.url || '';
          
          return imageUrl ? (
            <Image
              src={imageUrl}
              alt={row.original.title || 'Product'}
              width={50}
              height={50}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-400">No img</span>
            </div>
          );
        },
      },

      {
        accessorKey: "title",

        header: "Product Name",

        cell: ({ row }: any) => {
          const title = row.original.title || 'Untitled';
          const truncatedTitle =
            title.length > 25
              ? title.substring(0, 25) + "..."
              : title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },

      {
        accessorKey: "sale_price",

        header: "Price",

        cell: ({ row }: any) => (
          <span>
            ₹{row.original.sale_price || 0}
          </span>
        ),
      },

      {
        accessorKey: "stock",

        header: "Stock",

        cell: ({ row }: any) => (
          <span
            className={
              (row.original.stock || 0) < 10
                ? "text-red-500"
                : "text-white"
            }
          >
            {row.original.stock || 0} left
          </span>
        ),
      },

      {
        accessorKey: "category",

        header: "Category",

        cell: ({ row }: any) => (
          <span>{row.original.category || '-'}</span>
        ),
      },

      {
        accessorKey: "ratings",

        header: "Rating",

        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />

            <span className="text-white">
              {row.original.ratings || '5'}
            </span>
          </div>
        ),
      },

      {
        header: "Actions",

        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link
              href={`/product/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>

            <Link
              href={`/product/edit/${row.original.id}`}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <Pencil size={18} />
            </Link>

            <button
              className="text-green-400 hover:text-green-300 transition"
            >
              <BarChart size={18} />
            </button>

            <button
              className="text-red-400 hover:text-red-300 transition"
              onClick={() => openDeleteModel(row.original)}
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products || [],
    columns,

    getCoreRowModel: getCoreRowModel(),

    getFilteredRowModel:
      getFilteredRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),

    globalFilterFn: "includesString",

    state: {
      globalFilter,
    },

    onGlobalFilterChange:
      setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">
          All Products
        </h2>

        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-4">
        <Link
          href="/dashboard"
          className="text-blue-400 cursor-pointer"
        >
          Dashboard
        </Link>

        <ChevronRight
          size={18}
          className="text-gray-400"
        />

        <span className="text-white">
          All Products
        </span>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center bg-gray-900 p-3 rounded-md">
        <Search
          size={18}
          className="text-gray-400 mr-2"
        />

        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) =>
            setGlobalFilter(e.target.value)
          }
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">
            Loading products...
          </p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table
                .getHeaderGroups()
                .map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-800"
                  >
                    {headerGroup.headers.map(
                      (header) => (
                        <th
                          key={header.id}
                          className="p-3 text-left"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column
                                  .columnDef
                                  .header,
                                header.getContext()
                              )}
                        </th>
                      )
                    )}
                  </tr>
                ))}
            </thead>

            <tbody>
              {table
                .getRowModel()
                .rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    {row
                      .getVisibleCells()
                      .map((cell) => (
                        <td
                          key={cell.id}
                          className="p-3"
                        >
                          {flexRender(
                            cell.column
                              .columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {showDeleteModal && (
            <DeleteConfirmationModel
                product={selectedProduct}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => deleteMutation.mutate(selectedProduct.id)}
                onRestore={() => restoreMutation.mutate(selectedProduct.id)}
            />
        )}
      </div>
    </div>
  );
};

export default ProductList;