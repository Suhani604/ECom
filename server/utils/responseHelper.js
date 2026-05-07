export const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  })
}

export const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

export const paginatedResponse = (res, message, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page:       Number(page),
      limit:      Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext:    page * limit < total,
      hasPrev:    page > 1,
    },
  })
}