import { withCursorPagination } from "drizzle-pagination";

type PaginationOptions = Omit<
  Parameters<typeof withCursorPagination>[0],
  "limit"
  >;

interface PaginateOptions<T> {
  limit?: number;
  pagination: PaginationOptions;
  findMany: (
    options: ReturnType<typeof withCursorPagination>
  ) => Promise<T[]>;
  getCursor: (item: T) => unknown;
}

export async function paginate<T>({
  limit = 10,
  pagination,
  findMany,
  getCursor,
}: PaginateOptions<T>) {
  const safeLimit = Math.min(Math.max(1, limit), 100);

  const rows = await findMany(
    withCursorPagination({
      ...pagination,
      limit: safeLimit + 1,
    })
  );

  const hasNextPage = rows.length > safeLimit;
  const data = rows.slice(0, safeLimit);
  const lastItem = data.at(-1);

  return {
    data,
    pagination: {
      limit: safeLimit,
      nextCursor: hasNextPage && lastItem
        ? getCursor(lastItem)
        : null,
    },
  };
}
