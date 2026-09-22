import { Request, Response } from "express";
import mongoose from "mongoose";

import Enrollment from "../models/enrollment.model";
import User from "../models/user.model";
import Cohort from "../models/cohort.model";
import dbConnect from "../db";

/**
 * CREATE ENROLLMENT
 *
 * Enroll one or more students into a cohort.
 *
 * POST /enrollments
 *
 * Body:
 * {
 *   "cohort": "COHORT_ID",
 *   "students": [
 *     "STUDENT_ID_1",
 *     "STUDENT_ID_2"
 *   ]
 * }
 */
export const createEnrollment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { cohort, students } = req.body;

    if (!cohort) {
      return res.status(400).json({
        success: false,
        message: "Cohort is required.",
      });
    }

    if (!mongoose.isValidObjectId(cohort)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID.",
      });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one student is required.",
      });
    }

    /**
     * Remove duplicate student IDs
     */
    const uniqueStudentIds = [...new Set(students)];

    /**
     * Validate student ObjectIds
     */
    const invalidStudentId = uniqueStudentIds.find(
      (studentId) => !mongoose.isValidObjectId(studentId)
    );

    if (invalidStudentId) {
      return res.status(400).json({
        success: false,
        message: `Invalid student ID: ${invalidStudentId}`,
      });
    }

    /**
     * Check that cohort exists
     */
    const existingCohort = await Cohort.findById(cohort);

    if (!existingCohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found.",
      });
    }

    /**
     * Check whether an enrollment already exists
     */
    const existingEnrollment = await Enrollment.findOne({
      cohort,
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message:
          "An enrollment record already exists for this cohort. Use the add-students endpoint to add more students.",
      });
    }

    /**
     * Find students
     */
    const existingStudents = await User.find({
      _id: { $in: uniqueStudentIds },
      role: "student",
    }).select("_id fname lname email cohort status");

    if (existingStudents.length !== uniqueStudentIds.length) {
      const foundIds = existingStudents.map((student) =>
        student._id.toString()
      );

      const missingStudents = uniqueStudentIds.filter(
        (studentId) => !foundIds.includes(studentId.toString())
      );

      return res.status(404).json({
        success: false,
        message: "One or more students were not found.",
        missingStudents,
      });
    }

    /**
     * Prevent students already assigned to another cohort
     */
    const studentsAlreadyAssigned = existingStudents.filter(
      (student) => student.cohort
    );

    if (studentsAlreadyAssigned.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "One or more students are already assigned to a cohort.",
        students: studentsAlreadyAssigned.map((student) => ({
          id: student._id,
          name: `${student.fname} ${student.lname}`,
          email: student.email,
          cohort: student.cohort,
        })),
      });
    }

    /**
     * Create enrollment
     */
    const enrollment = await Enrollment.create({
      cohort,
      students: existingStudents.map((student) => student._id),
    });

    /**
     * Keep User.cohort synchronized
     */
    await User.updateMany(
      {
        _id: {
          $in: existingStudents.map((student) => student._id),
        },
      },
      {
        $set: {
          cohort,
        },
      }
    );

    await enrollment.populate([
      {
        path: "cohort",
        select: "title code startDate endDate status courses",
      },
      {
        path: "students",
        select: "fname lname email phone role img status cohort",
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Students enrolled successfully.",
      data: enrollment,
    });
  } catch (error: any) {
    console.error("Create Enrollment Error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An enrollment already exists for this cohort.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create enrollment.",
    });
  }
};

/**
 * GET ALL ENROLLMENTS
 *
 * GET /enrollments
 */
export const getEnrollments = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const enrollments = await Enrollment.find()
      .populate({
        path: "cohort",
        select: "title code startDate endDate status courses",
        populate: {
          path: "courses",
          select: "title slug duration",
        },
      })
      .populate({
        path: "students",
        select: "fname lname email phone role img status cohort",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error("Get Enrollments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch enrollments.",
    });
  }
};

/**
 * GET SINGLE ENROLLMENT
 *
 * GET /enrollments/:id
 */
export const getEnrollment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    const enrollment = await Enrollment.findById(id)
      .populate({
        path: "cohort",
        select: "title code startDate endDate status courses",
        populate: {
          path: "courses",
          select: "title slug duration",
        },
      })
      .populate({
        path: "students",
        select: "fname lname email phone role img status cohort",
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Get Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch enrollment.",
    });
  }
};

/**
 * GET ENROLLMENT BY COHORT
 *
 * GET /enrollments/cohort/:cohortId
 */
export const getEnrollmentByCohort = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { cohortId } = req.params;

    if (!mongoose.isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID.",
      });
    }

    const enrollment = await Enrollment.findOne({
      cohort: cohortId,
    })
      .populate({
        path: "cohort",
        select: "title code startDate endDate status courses",
        populate: {
          path: "courses",
          select: "title slug duration",
        },
      })
      .populate({
        path: "students",
        select: "fname lname email phone role img status cohort",
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "No enrollment record found for this cohort.",
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Get Enrollment By Cohort Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch cohort enrollment.",
    });
  }
};

/**
 * GET ENROLLMENT BY STUDENT
 *
 * GET /enrollments/student/:studentId
 */
export const getEnrollmentByStudent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const enrollment = await Enrollment.findOne({
      students: studentId,
    })
      .populate({
        path: "cohort",
        select: "title code startDate endDate status courses",
        populate: {
          path: "courses",
          select: "title slug duration",
        },
      })
      .populate({
        path: "students",
        select: "fname lname email phone role img status cohort",
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in any cohort.",
      });
    }

    return res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Get Enrollment By Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student enrollment.",
    });
  }
};

/**
 * ADD STUDENTS TO EXISTING ENROLLMENT
 *
 * PATCH /enrollments/:id/students
 *
 * Body:
 * {
 *   "students": ["STUDENT_ID_1", "STUDENT_ID_2"]
 * }
 */
export const addStudentsToEnrollment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;
    const { students } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one student is required.",
      });
    }

    const uniqueStudentIds = [...new Set(students)];

    const invalidStudentId = uniqueStudentIds.find(
      (studentId) => !mongoose.isValidObjectId(studentId)
    );

    if (invalidStudentId) {
      return res.status(400).json({
        success: false,
        message: `Invalid student ID: ${invalidStudentId}`,
      });
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    /**
     * Find valid students
     */
    const existingStudents = await User.find({
      _id: { $in: uniqueStudentIds },
      role: "student",
    }).select("_id fname lname email cohort status");

    if (existingStudents.length !== uniqueStudentIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more students were not found.",
      });
    }

    /**
     * Check students already enrolled in this enrollment
     */
    const alreadyEnrolled = existingStudents.filter((student) =>
      enrollment.students.some(
        (existingStudentId) =>
          existingStudentId.toString() === student._id.toString()
      )
    );

    if (alreadyEnrolled.length > 0) {
      return res.status(409).json({
        success: false,
        message: "One or more students are already enrolled in this cohort.",
        students: alreadyEnrolled.map((student) => ({
          id: student._id,
          name: `${student.fname} ${student.lname}`,
          email: student.email,
        })),
      });
    }

    /**
     * Check whether students belong to another cohort
     */
    const studentsInAnotherCohort = existingStudents.filter(
      (student) =>
        student.cohort &&
        student.cohort.toString() !== enrollment.cohort.toString()
    );

    if (studentsInAnotherCohort.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "One or more students are already assigned to another cohort.",
        students: studentsInAnotherCohort.map((student) => ({
          id: student._id,
          name: `${student.fname} ${student.lname}`,
          email: student.email,
          cohort: student.cohort,
        })),
      });
    }

    const newStudentIds = existingStudents.map((student) => student._id);

    enrollment.students.push(...newStudentIds);

    await enrollment.save();

    /**
     * Synchronize User.cohort
     */
    await User.updateMany(
      {
        _id: { $in: newStudentIds },
      },
      {
        $set: {
          cohort: enrollment.cohort,
        },
      }
    );

    await enrollment.populate([
      {
        path: "cohort",
        select: "title code startDate endDate status courses",
      },
      {
        path: "students",
        select: "fname lname email phone role img status cohort",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Students added to enrollment successfully.",
      data: enrollment,
    });
  } catch (error) {
    console.error("Add Students To Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add students to enrollment.",
    });
  }
};

/**
 * REMOVE STUDENT FROM ENROLLMENT
 *
 * DELETE /enrollments/:id/students/:studentId
 */
export const removeStudentFromEnrollment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id, studentId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(studentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment or student ID.",
      });
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    const studentIndex = enrollment.students.findIndex(
      (student) => student.toString() === studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this cohort.",
      });
    }

    enrollment.students.splice(studentIndex, 1);

    await enrollment.save();

    /**
     * Remove cohort assignment from User
     */
    await User.findByIdAndUpdate(studentId, {
      $unset: {
        cohort: 1,
      },
    });

    await enrollment.populate([
      {
        path: "cohort",
        select: "title code startDate endDate status courses",
      },
      {
        path: "students",
        select: "fname lname email phone role img status cohort",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Student removed from enrollment successfully.",
      data: enrollment,
    });
  } catch (error) {
    console.error("Remove Student From Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove student from enrollment.",
    });
  }
};

/**
 * DELETE ENROLLMENT
 *
 * DELETE /enrollments/:id
 */
export const deleteEnrollment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    /**
     * Remove cohort assignment from all students
     * belonging to this enrollment.
     */
    await User.updateMany(
      {
        _id: { $in: enrollment.students },
        cohort: enrollment.cohort,
      },
      {
        $unset: {
          cohort: 1,
        },
      }
    );

    await Enrollment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Enrollment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete enrollment.",
    });
  }
};