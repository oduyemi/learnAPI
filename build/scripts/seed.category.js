"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../db/index");
const category_model_1 = __importDefault(require("../models/category.model"));
const categories = [
    {
        title: "Programming Fundamentals",
        desc: "Foundational programming concepts, algorithms, logical thinking and problem-solving for aspiring software developers.",
    },
    {
        title: "Web Development",
        desc: "Frontend, backend and full-stack web development using modern technologies and frameworks.",
    },
    {
        title: "Data & Databases",
        desc: "SQL, databases, data analysis, data engineering and business intelligence tools.",
    },
    {
        title: "Developer Professional Skills",
        desc: "Git, GitHub, Agile, Scrum, collaboration, communication, code reviews and modern software engineering workflows.",
    },
    {
        title: "Product Management",
        desc: "Product strategy, user-centered design, product planning and execution.",
    },
    {
        title: "General Learning",
        desc: "General-purpose learning resources that are applicable across multiple disciplines.",
    },
];
async function seedCategories() {
    await (0, index_1.dbConnect)();
    for (const category of categories) {
        await category_model_1.default.findOneAndUpdate({ title: category.title }, category, { upsert: true, new: true });
    }
    console.log("Categories seeded.");
    await mongoose_1.default.disconnect();
}
seedCategories().catch(console.error);
