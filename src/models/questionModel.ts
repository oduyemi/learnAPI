import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  question_text: string;
  options: {
    option: string;
    isCorrect: boolean;
  }[];
  difficulty_level: "easy" | "medium" | "hard";
  course_id: mongoose.Types.ObjectId
  category: mongoose.Types.ObjectId;
}

const questionSchema: Schema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [{
      option: String,
      isCorrect: Boolean
    }],
    required: true,
    validate: {
      validator: function(options: any[]) {
        return options.length === 4;
      },
      message: "Exactly four options are required"
    }
  },
  difficultyLevel: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories', 
    required: true,
  },
});

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;
