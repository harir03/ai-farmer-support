// Response helper functions

export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

// Date helper functions
export const dateHelpers = {
  // Get start and end of day
  getStartOfDay: (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  },

  getEndOfDay: (date = new Date()) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  },

  // Get date range for common periods
  getDateRange: (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = dateHelpers.getStartOfDay(now);
        endDate = dateHelpers.getEndOfDay(now);
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = dateHelpers.getStartOfDay(yesterday);
        endDate = dateHelpers.getEndOfDay(yesterday);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = now;
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = now;
        break;
      default:
        startDate = null;
        endDate = null;
    }

    return { startDate, endDate };
  },

  // Format date for display
  formatDate: (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      default:
        return d.toLocaleDateString();
    }
  },

  // Check if date is in the past
  isPastDate: (date) => {
    return new Date(date) < new Date();
  },

  // Get days between two dates
  getDaysBetween: (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
  }
};

// String helper functions
export const stringHelpers = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Generate slug from string
  generateSlug: (str) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },

  // Truncate string
  truncate: (str, length = 100) => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  // Remove HTML tags
  stripHtml: (str) => {
    return str.replace(/<[^>]*>/g, '');
  }
};

// Array helper functions
export const arrayHelpers = {
  // Remove duplicates from array
  removeDuplicates: (arr) => {
    return [...new Set(arr)];
  },

  // Chunk array into smaller arrays
  chunk: (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  // Get random items from array
  getRandomItems: (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
};

// File helper functions
export const fileHelpers = {
  // Get file extension
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },

  // Check if file is image
  isImage: (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(fileHelpers.getFileExtension(filename));
  },

  // Generate unique filename
  generateUniqueFilename: (originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = fileHelpers.getFileExtension(originalName);
    return `${timestamp}_${random}.${extension}`;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};