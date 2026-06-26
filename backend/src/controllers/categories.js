import { CATEGORIES } from "../config/categories.js";

export const getCategories = (req, res) => {
  res.status(200).json(CATEGORIES);
};
