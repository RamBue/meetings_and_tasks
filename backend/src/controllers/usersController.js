import User from "../models/user.js";
import { pick } from "../utils/sanitize.js";
import { handleError } from "../utils/errors.js";

// GET all users
// Es werden nur die Namen ausgeliefert, E-Mail-Adressen braucht kein Client
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers controller", error);
    handleError(res, error);
  }
};

// CREATE user
export const createUser = async (req, res) => {
  try {
    const user = await User.create(pick(req.body, ["name", "email"]));

    res.status(201).json(user);
  } catch (error) {
    console.error("Error in createUser controller", error);
    handleError(res, error);
  }
};
