const User = require("../models/user");
const ResetToken = require("../models/resetToken");

const { sendError } = require("../utils/helpers");
const { isValidObjectId } = require("mongoose");

exports.isResetTokenValid = async (req, res, next) => {
  const { token, id } = req.query;
  if (!token || !id) return sendError(res, "Invalid request!");

  if (!isValidObjectId(id)) return sendError(res, "Invalid user!");

  const user = await User.findById(id);
  if (!user) return sendError(res, "User not found!");

  const resetToken = await ResetToken.findOne({ owner: user._id });
  if (!resetToken) return sendError(res, "Reset Token not found!");

  const isValid = await resetToken.compareToken(token);
  if (!isValid) return sendError(res, "Reset Token is invalid!");

  req.user = user;
  next();
};
