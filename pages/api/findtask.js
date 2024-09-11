import { inserttask, findTaskList } from "./notes.js";


export default async function handler(req, res) {
    const taskname = req.body.taskname;
    console.log('taskname', taskname)
    const TaskList = await findTaskList(taskname);
    console.log('TaskList', TaskList);
    res.json({ message: 'tasklist get successfully', TaskList: TaskList});
};
