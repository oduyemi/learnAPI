import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  desc: string;
  category: mongoose.Types.ObjectId;
  thumbnail: string;
  instructors: mongoose.Types.ObjectId[];
  duration: string;
  hasCertificate: boolean;
  certificateTemplate?: string;
  isGeneral: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    desc: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    duration: {
      type: String,
      required: true,
    },

    hasCertificate: {
      type: Boolean,
      default: false,
    },

    certificateTemplate: {
      type: String,
    },

    isGeneral: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;