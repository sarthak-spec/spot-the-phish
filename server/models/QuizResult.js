
import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

const QuizResult = mongoose.model(
  "QuizResult",
  quizResultSchema
);

export default QuizResult;
