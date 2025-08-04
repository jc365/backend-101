import mongoose from "mongoose";

// Security limits and default values for pagination
const MAX_PAGE_SIZE = 100;
const MAX_LIMIT = 100;
const DEFAULT_ITEMS_PAGE = 20;
const DEFAULT_MODE = "page";

function parsePaginationParams(req) {
  const mode = req.query.mode || DEFAULT_MODE;

  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || DEFAULT_ITEMS_PAGE, 1),
    MAX_LIMIT
  );

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const pageSize = Math.min(
    Math.max(parseInt(req.query.page_size, 10) || DEFAULT_ITEMS_PAGE, 1),
    MAX_PAGE_SIZE
  );

  const after = req.query.after || null;

  return { mode, limit, page, pageSize, after };
}

function buildCombinedFilter(baseFilter = {}, cursorFilter = {}) {
  const hasBase = Object.keys(baseFilter).length > 0;
  const hasCursor = Object.keys(cursorFilter).length > 0;

  if (hasBase && hasCursor) {
    if (baseFilter.$and) {
      return { $and: [...baseFilter.$and, cursorFilter] };
    }
    return { $and: [baseFilter, cursorFilter] };
  }
  if (hasBase) return baseFilter;
  if (hasCursor) return cursorFilter;
  return {};
}

async function paginateCursor(
  Model,
  baseFilter,
  baseUrl,
  queryParams,
  limit,
  after
) {
  let cursorFilter = {};

  if (after) {
    try {
      cursorFilter = { _id: { $gt: new mongoose.Types.ObjectId(after) } };
    } catch (e) {
      throw new Error('Parámetro "after" no es un ObjectId válido');
    }
  }

  const combinedFilter = buildCombinedFilter(baseFilter, cursorFilter);

  const items = await Model.find(combinedFilter)
    .sort({ _id: 1 })
    .limit(limit + 1)
    .exec();

  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, limit) : items;

  const nextCursor = hasMore
    ? results[results.length - 1]._id.toString()
    : null;

  const links = {
    self: buildUrl(baseUrl, queryParams),
    first: buildUrl(baseUrl, { ...queryParams, after: null }),
    next: hasMore
      ? buildUrl(baseUrl, { ...queryParams, after: nextCursor })
      : null,
    prev: null, // No implementado porque es más complejo
    last: null,
  };

  return {
    data: results,
    pagination: {
      mode: "cursor",
      limit,
      next_cursor: nextCursor,
      has_more: hasMore,
    },
    links,
  };
}

async function paginatePage(
  Model,
  baseFilter,
  baseUrl,
  queryParams,
  page,
  pageSize
) {
  const total = await Model.countDocuments(baseFilter).exec();
  const totalPages = Math.ceil(total / pageSize);
  if (page > totalPages && totalPages > 0) page = totalPages;

  const skip = (page - 1) * pageSize;

  const items = await Model.find(baseFilter)
    .sort({ _id: 1 })
    .skip(skip)
    .limit(pageSize)
    .exec();

  const hasMore = page < totalPages;

  const links = {
    self: buildUrl(baseUrl, queryParams),
    first: buildUrl(baseUrl, { ...queryParams, page: 1 }),
    last: buildUrl(baseUrl, { ...queryParams, page: totalPages }),
    prev:
      page > 1 ? buildUrl(baseUrl, { ...queryParams, page: page - 1 }) : null,
    next: hasMore
      ? buildUrl(baseUrl, { ...queryParams, page: page + 1 })
      : null,
  };

  return {
    data: items,
    pagination: {
      mode: "page",
      page,
      page_size: pageSize,
      total,
      total_pages: totalPages,
      has_more: hasMore,
    },
    links,
  };
}

/**
 * Construye una URL relativa con los parámetros de query indicados,
 * manteniendo los parámetros existentes y sobreescribiendo con los enviados.
 *
 * @param {string} baseUrl - La URL base (path y query base).
 * @param {object} queryParams - Objeto con parámetros query a ajustar.
 * @returns {string} URL relativa con los parámetros ajustados.
 *
 * NOTE: This is a internal function and not exportable
 */
function buildUrl(baseUrl, queryParams) {
  const url = new URL(baseUrl, "http://unknow");

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  // Devolvemos solo path + search, sin el hostname ficticio
  return url.pathname + url.search;
}

export default async function paginate(Model, req, baseUrl, baseFilter = {}) {
  const { mode, limit, page, pageSize, after } = parsePaginationParams(req);
  const queryParams = { ...req.query };

  if (mode === "cursor") {
    return await paginateCursor(
      Model,
      baseFilter,
      baseUrl,
      queryParams,
      limit,
      after
    );
  } else {
    return await paginatePage(
      Model,
      baseFilter,
      baseUrl,
      queryParams,
      page,
      pageSize
    );
  }
}
