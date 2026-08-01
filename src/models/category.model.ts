import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId; 
  title: string;
  desc: string;
}

const categorySchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
