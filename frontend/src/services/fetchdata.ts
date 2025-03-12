import axios from "@/services/asios";
import { ICategory, ICourses, ILesson, ITask } from "./interface/CourseDto";
import toast from "react-hot-toast";
export const fetchUsers = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    return error;
  }
};
export const addCategory = async ({ Category, Description }: ICategory) => {
  try {
    const datas = await axios.post("/addcategory", {
      name: Category,
      description: Description,
    });
    return datas;
  } catch (error) {
    return error;
  }
};
export const allCategorys = async () => {
  try {
    const data = await axios.get("/mentor/categorys");
    console.log(data);
    return data.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const addCourse = async (data) => {
  try {
    return await axios.post("/mentor/addcourse", { data });
  } catch (error: any) {
    return error.response.data;
  }
};
export const getlessons = async (lessonid: string) => {
  try {
    return await axios.post("/mentor/lessons", { lessonid });
  } catch (error: any) {
    return error.response.data;
  }
};
export const getcourse = async () => {
  try {
    const data = await axios.get("/mentor/courses");
    console.log(data);
    return data.data;
  } catch (error: any) {
    return error.response.data;
  }
};
export const getunaprovedCourse = async (page: number, typeofList: string) => {
  try {
    const data = await axios.get("/getcourse/" + page + "/" + typeofList);
    console.log(data);
    return data.data;
  } catch (error: any) {
    return error.response.data;
  }
};
export const actionCourse = async (id: string, action: boolean) => {
  try {
    const data = await axios.post("/mentor/action/" + id, { action });
    console.log(data, "in axiffos");

    return data.data;
  } catch (error) {
    return error.response.data;
  }
};
export const butCousePageData = async (id: string) => {
  try {
    await axios.get("/course/" + id);
    return;
  } catch (error) {}
};
export const getAllcourseUser = async () => {
  const data = await axios.get("/allcourses?limit=4");
  return data.data;
};
export const getSelectedCourse = async (id: string) => {
  try {
    const data = await axios.get("/course/" + id);
    console.log(data, "from bakend");
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const purchaseCourse = async (courseId: string) => {
  try {
    await axios.post("/purchase/" + courseId);
    return true;
  } catch (error) {
    // console.log();

    throw new Error(error.response.data.message);
  }
};
export const updateCourse = (
  courseId: string,
  data: object,
  deleted?: object
) => {
  axios.post("/mentor/courseupdate/" + courseId, { data, deleted });
};
export const deleteLesson = async (courseId: string, lessonId: string) => {
  await axios.post("/mentor/deletelesson/" + courseId, { lessonId });
  return;
};
export const deleteCourse = async (courseid: string) => {
  try {
    await axios.post("/mentor/course/delete", { courseid });
    console.log("done");

    return;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
export const addNewTaskDb = async (
  Taskdata: ITask,
  lessonid: string,
  courseId: string
) => {
  await axios.post("/mentor/addTask/" + lessonid, { Taskdata, courseId });
  return;
};
export const addnewLesson = async (
  data: Omit<ILesson, "_id">,
  courseId: string
) => {
  await axios.post("/mentor/addlesson", { data, courseId });
};
export const deleteTask = async (
  taskid: string,
  lessonid: string,
  courseId: string
) => {
  await axios.post("/mentor/task/delete", { taskid, lessonid, courseId });
  return;
};

export const editcourse = async (id: string, data: Partial<ICategory>) => {
  const response = await axios.post("/editCategory/" + id, { data });
  return response;
};
export const deleteCategory = async (id: string) => {
  const response = await axios.delete("/deleteCategory/" + id);
  return response;
};
export const startChat = async (courseid: string) => {
  const id=await axios.post("/startchat", { courseid });
  console.log(id);
  return id.roomid
};
export const getallchat=async (roomid:string)=>{
 const data= await axios.get('/getchat/'+roomid)
 console.log(data);
 return data
}
export const getChatrooms=async()=>{
  const data=await axios.get('/mentor/getchats')
  console.log(data);
  return data
}
