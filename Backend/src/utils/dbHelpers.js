// Database helper functions

export const aggregatePipeline = {
  // Get user task statistics
  userTaskStats: (userId) => [
    {
      $match: { userId }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: ['$completed', 1, 0] } },
        pending: { $sum: { $cond: ['$completed', 0, 1] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$completed', false] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ],

  // Get field crop statistics
  fieldCropStats: (userId) => [
    {
      $match: { userId }
    },
    {
      $unwind: { path: '$crops', preserveNullAndEmptyArrays: true }
    },
    {
      $group: {
        _id: '$crops.status',
        count: { $sum: 1 },
        crops: { $push: '$crops.cropName' }
      }
    }
  ],

  // Get popular community topics
  popularTopics: () => [
    {
      $match: { isActive: true }
    },
    {
      $unwind: '$tags'
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 },
        posts: { $push: '$_id' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]
};

// Common database operations
export const dbOperations = {
  // Soft delete
  softDelete: async (Model, id, userId = null) => {
    const filter = { _id: id };
    if (userId) filter.userId = userId;
    
    return await Model.findOneAndUpdate(
      filter,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );
  },

  // Paginated find
  paginatedFind: async (Model, filter = {}, options = {}) => {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = null
    } = options;

    const skip = (page - 1) * limit;

    let query = Model.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }

    const [docs, total] = await Promise.all([
      query.exec(),
      Model.countDocuments(filter)
    ]);

    return {
      docs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
};

// Search helpers
export const searchHelpers = {
  // Create text search filter
  createTextSearchFilter: (searchTerm, fields) => {
    if (!searchTerm) return {};

    const regex = new RegExp(searchTerm, 'i');
    return {
      $or: fields.map(field => ({ [field]: regex }))
    };
  },

  // Create date range filter
  createDateRangeFilter: (field, startDate, endDate) => {
    const filter = {};
    
    if (startDate || endDate) {
      filter[field] = {};
      if (startDate) filter[field].$gte = new Date(startDate);
      if (endDate) filter[field].$lte = new Date(endDate);
    }

    return filter;
  }
};

// Validation helpers
export const validationHelpers = {
  // Check if ObjectId is valid
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  // Sanitize string input
  sanitizeString: (str, maxLength = 1000) => {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength);
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};