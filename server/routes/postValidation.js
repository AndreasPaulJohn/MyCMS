const { Category } = require('../models');

exports.validateCategoryIds = async (categoryIds) => {
  if (!Array.isArray(categoryIds)) return false;
  const validCategories = await Category.findAll({
    where: { id: categoryIds }
  });
  return validCategories.length === categoryIds.length;
};