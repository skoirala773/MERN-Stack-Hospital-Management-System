import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, dob, gender, appointment_date, department, doctor_firstName, doctor_lastName, hasVisited, address } = req.body || {};
    if (!firstName || !lastName || !email || !phone || !dob || !gender || !appointment_date || !department || !doctor_firstName || !doctor_lastName || !address) {
        return next(new ErrorHandler("Please fill full details!", 400));
    }
    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department,
    })
    if (isConflict.length === 0) {
        return next(new ErrorHandler("Doctor not found!", 404));
    }
    if (isConflict.length > 1) {
        return next(new ErrorHandler("Doctors Conflict! Please contact through email or phone.", 404));
    }
    const doctorId = isConflict[0]._id;
    const patientId = req.user._id;
    const appointment = await Appointment.create({
        firstName, lastName, email, phone, dob, gender, appointment_date, department,
        doctor: {
            firstName: doctor_firstName,
            lastName: doctor_lastName,
        },
        hasVisited, address, doctorId, patientId,
    });
    res.status(200).json({
        success: true,
        message: "Appointment sent successfully!",
        appointment,
    });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {

    const appointments = await Appointment.find().populate("doctorId", "firstName lastName doctorDepartment");
    res.status(200).json({
        success: true,
        appointments,
    });
});


export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { doctorId, department, appointment_date, status, edited } = req.body;

    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }


    let finalDateToSave;
    if (appointment_date) {

        finalDateToSave = new Date(appointment_date);

        finalDateToSave.setUTCHours(12, 0, 0, 0);
    } else {
        finalDateToSave = appointment.appointment_date;
    }

    let newDoctorDetails = null;
    if (doctorId) {
        newDoctorDetails = await User.findById(doctorId);
        if (!newDoctorDetails || newDoctorDetails.role !== "Doctor") {
            return next(new ErrorHandler("Selected Doctor ID is invalid or not a Doctor.", 400));
        }
    }


    const updateFields = {
        appointment_date: finalDateToSave,
        department,
        status,
        edited,
        doctorId,
        "doctor.firstName": newDoctorDetails?.firstName || appointment.doctor.firstName,
        "doctor.lastName": newDoctorDetails?.lastName || appointment.doctor.lastName,

    };


    appointment = await Appointment.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    const populatedAppointment = await Appointment.findById(appointment._id).populate(
        "doctorId",
        "firstName lastName doctorDepartment"
    );

    res.status(200).json({
        success: true,
        message: "Appointment Updated Successfully!",
        appointment: populatedAppointment,
    });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found!", 404));
    }
    await appointment.deleteOne();
    res.status(200).json({
        success: true,
        message: "Appointment deleted!",
    });
});

export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
    const patientId = req.user._id;
    const appointments = await Appointment.find({ patientId }).populate(
        "doctorId",
        "firstName lastName doctorDepartment"
    );
    res.status(200).json({
        success: true,
        appointments,
    });
});