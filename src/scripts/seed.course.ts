import mongoose from "mongoose";
import slugify from "slugify";
import { dbConnect } from "../db/index";
import Course from "../models/course.model";

const DEFAULT_INSTRUCTOR = new mongoose.Types.ObjectId(
  "6a6e67103adb73d8c4e2027f"
);

const CATEGORY = {
  PROGRAMMING: new mongoose.Types.ObjectId("6a6e6ab6dc83b75d0959da32"),
  WEB: new mongoose.Types.ObjectId("6a6e6ab6dc83b75d0959da33"),
  DATA: new mongoose.Types.ObjectId("6a6e6ab7dc83b75d0959da34"),
  PROFESSIONAL: new mongoose.Types.ObjectId("6a6e6ab7dc83b75d0959da35"),
  PRODUCT: new mongoose.Types.ObjectId("6a6e6ab7dc83b75d0959da36"),
};

async function seedCourses() {
  try {
    await dbConnect();

    const courses = [
      {
        title: "Programming Fundamentals",
        desc:
          "Learn the basics of programming using modern languages while mastering core programming concepts, algorithms, logical thinking and problem-solving.",
        category: CATEGORY.PROGRAMMING,
        duration: "4 Weeks",
      },
      {
        title: "SQL & Databases",
        desc:
          "Learn SQL from beginner to intermediate level including querying, relational databases, data manipulation and reporting.",
        category: CATEGORY.DATA,
        duration: "4 Weeks",
      },
      {
        title: "Technical Skills for Developers",
        desc:
          "Master Git, GitHub, Agile, Scrum, collaboration, code reviews, task management and developer workflows used by modern engineering teams.",
        category: CATEGORY.PROFESSIONAL,
        duration: "2 Weeks",
      },
      {
        title: "Product Management",
        desc:
          "Develop strategic thinking, product planning, user-centered design and product lifecycle management.",
        category: CATEGORY.PRODUCT,
        duration: "6 Weeks",
      },
      {
        title: "Data Analysis",
        desc:
          "Learn Excel, SQL, Python and Power BI to clean, analyze and visualize business data effectively.",
        category: CATEGORY.DATA,
        duration: "8 Weeks",
      },
      {
        title: "Frontend Development",
        desc:
          "Build beautiful, responsive and interactive web applications using HTML, CSS, JavaScript, React and modern frontend tooling.",
        category: CATEGORY.WEB,
        duration: "12 Weeks",
      },
      {
        title: "Backend Development",
        desc:
          "Learn APIs, authentication, databases, Node.js, Express, security and scalable backend architecture.",
        category: CATEGORY.WEB,
        duration: "12 Weeks",
      },
      {
        title: "Full-Stack Web Development",
        desc:
          "Become a full-stack developer by mastering both frontend and backend technologies while building real-world applications.",
        category: CATEGORY.WEB,
        duration: "24 Weeks",
      },
      {
        title: "Data Engineering",
        desc:
          "Learn SQL, Python, ETL pipelines, data warehousing, Power BI and modern data engineering practices.",
        category: CATEGORY.DATA,
        duration: "10 Weeks",
      },
    ];

    for (const course of courses) {
      const slug = slugify(course.title, {
        lower: true,
        strict: true,
        trim: true,
      });

      await Course.findOneAndUpdate(
        { slug },
        {
          ...course,
          slug,
          thumbnail: "/images/courses/default.webp",
          instructors: [DEFAULT_INSTRUCTOR],
          hasCertificate: true,
          certificateTemplate: "default-certificate",
          isGeneral: false,
          createdBy: DEFAULT_INSTRUCTOR,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("Courses seeded successfully.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);

    await mongoose.disconnect();
    process.exit(1);
  }
}

seedCourses();