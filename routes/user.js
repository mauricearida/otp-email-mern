const router = require("express").Router();

const {
  createUser,
  signin,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/user");
const { validateUser, validate } = require("../middlewares/validator");

const { isResetTokenValid } = require("../middlewares/user");

router.post("/create", validateUser, validate, createUser);
router.post("/signin", signin);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", isResetTokenValid, resetPassword);
router.post("/verify-token", isResetTokenValid, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
