/**
 * Reusable pagination helper for Mongoose queries.
 *
 * @param {import("mongoose").Model} model - Mongoose Model
 * @param {Object} filter - Query filter
 * @param {Object} options - Pagination options { page, limit, maxLimit, sort, select, populate }
 * @returns {Promise<{ items: Array, page: Number, limit: Number, total: Number, totalPages: Number }>}
 */
export const paginate = async (
  model,
  filter = {},
  {
    page = 1,
    limit = 10,
    maxLimit = 100,
    sort = { createdAt: -1 },
    select = null,
    populate = null,
  } = {}
) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(limit, 10) || 10)
  );
  const skip = (parsedPage - 1) * parsedLimit;

  let query = model.find(filter).sort(sort).skip(skip).limit(parsedLimit);

  if (select) {
    query = query.select(select);
  }

  if (populate) {
    query = query.populate(populate);
  }

  const [items, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  return {
    items,
    page: parsedPage,
    limit: parsedLimit,
    total,
    totalPages: Math.ceil(total / parsedLimit),
  };
};

export default paginate;
