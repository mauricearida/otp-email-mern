const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");

const {
  generateOTP,
  mailTransport,
  generateEmailTemplate,
  plainEmailTemplate,
  generatePasswordResetTemplate,
} = require("../utils/mail");
const User = require("../models/user");
const ResetToken = require("../models/resetToken");
const VerificationToken = require("../models/verificationToken");
const { sendError, createRandomBytes } = require("../utils/helpers");

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("454545");
  const user = await User.findOne({ email });
  if (user) return sendError(res, "This email already exists");

  const newUser = new User({
    name,
    email,
    password,
  });

  const OTP = generateOTP();

  const verificationToken = new VerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await verificationToken.save();
  await newUser.save();

  mailTransport().sendMail({
    from: "maurice.arida77@gmail.com",
    to: newUser.email,
    subject: "Verify you remail account",
    html: generateEmailTemplate(OTP),
  });
  res.json({
    success: true,
    user: {
      name: newUser.name,
      email: newUser.email,
      id: newUser._id,
      verified: newUser.verified,
    },
  });
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email.trim() || !password.trim())
      return sendError(res, "email/password missing");

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found");

    const isMatched = await user.comparePassword(password);
    if (!isMatched) return sendError(res, "Wrong password");

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      user: { name: user.name, email: user.email, id: user._id, token: token },
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp.trim())
    return sendError(res, "Invalid request, missing parameters!");

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user id");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "Sorry, user not found!");

  if (user.verified) return sendError(res, "This account is already verified!");

  const token = await VerificationToken.findOne({ owner: user._id });
  if (!token) return sendError(res, "Sorry, user not found!");

  const isMatched = await token.compareToken(otp);
  if (!isMatched) return sendError(res, "Please provide a valid token!");

  user.verified = true;

  await VerificationToken.findByIdAndDelete(token._id);
  await user.save();

  mailTransport().sendMail({
    from: "maurice.arida77@gmail.com",
    to: user.email,
    subject: "Welcome email",
    html: plainEmailTemplate(
      "Email Verified Successfully",
      "Thanks for connecting with us"
    ),
  });

  res.json({
    success: true,
    message: "your email is verified.",
    user: { name: user.name, email: user.email, id: user._id },
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, "Please provide a valid email!");

  const user = await User.findOne({ email });
  console.log("user", user);

  if (!user) return sendError(res, "User not found, inalid request");

  const token = await ResetToken.findOne({ owner: user._id });
  console.log("token", token);
  if (token)
    return sendError(res, "Only after one hour you can request another token");

  const randomBytes = await createRandomBytes();
  const resetToken = new ResetToken({ owner: user._id, token: randomBytes });

  await resetToken.save();

  mailTransport().sendMail({
    from: "security@gmail.com",
    to: user.email,
    subject: "Password Reset email",
    html: generatePasswordResetTemplate(
      `http://localhost:3000/reset-password?token=${randomBytes}&id=${user._id}`
    ),
  });

  res.json({
    success: true,
    message: "Password reset link is sent to your email.",
  });
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return sendError(res, "User not found");

  const isSamePassword = await user.comparePassword(password);
  if (isSamePassword) return sendError(res, "Cannot use old password!");

  if (password.trim().length < 8 || password.trim().length > 20)
    return sendError(res, "Password must be between 8 and 20 characters!");

  user.password = password.trim();
  await user.save();

  await ResetToken.findOneAndDelete({ owner: user._id });

  mailTransport().sendMail({
    from: "security@gmail.com",
    to: user.email,
    subject: "Password Reset Successfully",
    html: plainEmailTemplate(
      "password Reset Successfully",
      "Now you can login with new Password!"
    ),
  });

  res.json({ success: true, message: "Password Reset Succesfully" });
};
