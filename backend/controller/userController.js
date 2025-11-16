import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, role } = req.body || {};
  if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !role) {
    return next(new ErrorHandler("Please fill the required fields!", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User is already registered!", 400));
  }
  user = await User.create({ firstName, lastName, email, phone, password, gender, dob, role });
  generateToken(user, "User Registration Successful!", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body || {};
  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please provide the required details!", 400));
  }
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and Confirm Password do not match!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password!", 400));
  }
  const isPaswordMatched = await user.comparePassword(password);
  if (!isPaswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password!", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler("User with this role not found!", 400));
  }
  generateToken(user, "User log in Successful!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob } = req.body || {};
  if (!firstName || !lastName || !email || !phone || !password || !gender || !dob) {
    return next(new ErrorHandler("Please fill the required fields!", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} with this email already exists!`));
  }
  await User.create({ firstName, lastName, email, phone, password, gender, dob, role: "Admin" });
  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
  });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res.status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin logged out successfully!",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res.status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient logged out successfully!",
    });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format not supported!", 400));
  }
  const { firstName, lastName, email, phone, password, gender, dob, doctorDepartment } = req.body || {};
  if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !doctorDepartment) {
    return next(new ErrorHandler("Please provide full details!", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} already registered with this email!`, 400));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary Error");
  }
  const doctor = await User.create({
    firstName, lastName, email, phone, password, gender, dob, doctorDepartment, role: "Doctor", docAvatar: {
      public_id: cloudinaryResponse.public_id, url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered!",
    doctor
  });
});

export const updateDoctor = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let doctor = await User.findOne({ _id: id, role: "Doctor" });
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found!", 404));
  }
  const updates = { ...req.body };
  delete updates.password;
  delete updates.docAvatar;

  if (req.files && req.files.docAvatar) {
    const docAvatar = req.files.docAvatar;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
      return next(new ErrorHandler("File Format not supported!", 400));
    }
    // Optional: Remove old avatar from Cloudinary here if needed

    const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      return next(new ErrorHandler("Error uploading image to Cloudinary", 500));
    }
    updates.docAvatar = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  doctor = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Doctor updated successfully!",
    doctor,
  });
});

export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let doctor = await User.findOne({ _id: id, role: "Doctor" });
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found!", 404));
  }
  await doctor.deleteOne();
  res.status(200).json({
    success: true,
    message: "Doctor deleted!",
  });
});
