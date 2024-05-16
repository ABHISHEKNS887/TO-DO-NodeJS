import mongoose, {Schema} from "mongoose";

const todoSchema = new Schema(
    {
        "content": {
            type : String,
            required: true
        },
        "complete": {
            type: Boolean,
            default: false
        },
        "createdBy": {
            type: String,
            required: true
        },
        "subTodos": [
            {
                type: Schema.Types.ObjectId,
                ref: "SubTodo"
            }
        ]
    }
, 
{"timestamps": true})

export const Todo = new mongoose.model('Todo', todoSchema);