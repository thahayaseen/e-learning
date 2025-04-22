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
  } catch (error: any) {
    console.log(error.message);
    toast.error(error.message);

    return false;
  }
};
export const allCategorys = async (qury) => {
  try {
    const data = await axios.get("/mentor/categorys" + qury);
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const addCourse = async (data) => {
  try {
    return await axios.post("/mentor/addcourse", { data });
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};
export const getlessons = async (lessonid: string) => {
  try {
    return await axios.post("/mentor/lessons", { lessonid });
  } catch (error: any) {
    return error.response.data;
  }
};
export const getcourse = async ({
  page,
  limit,
  search,
  status,
  priceRange,
  sortBy,
}: any) => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination parameters
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    // Add filter parameters

    if (search) queryParams.append("search", search);
    if (status) queryParams.append("status", status);
    if (priceRange) queryParams.append("priceRange", priceRange);
    if (sortBy) queryParams.append("sortBy", sortBy);

    console.log(queryParams, "wury is ");

    const data = await axios.get("/mentor/courses?" + queryParams);
    console.log(data);
    return data.data;
  } catch (error: any) {
    console.log(error);

    return error.response?.data || "unable to Fetch data ";
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
export const getAllcourseUser = async (
  {
    page = 1,
    limit = 10,
    filter = {},
    sort = {
      field: "UpdatedAt",
      order: "desc",
    },
  }: any = {},
  publicr = false
) => {
  // Construct query parameters
  const queryParams = new URLSearchParams();

  // Add pagination parameters
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  console.log("searcyh is", filter);

  // if(publicr){
  //   queryParams.append('publicRoute','true')
  // }
  // Add filter parameters
  if (filter) {
    if (filter.search) queryParams.append("search", filter.search);
    if (filter.level) queryParams.append("level", filter.level);
    if (filter.category) queryParams.append("category", filter.category);
    if (filter.mentor) queryParams.append("mentor", filter.mentor);

    // Handle price filter
    if (filter.price) {
      if (filter.price.min !== undefined)
        queryParams.append("priceMin", filter.price.min.toString());
      if (filter.price.max !== undefined)
        queryParams.append("priceMax", filter.price.max.toString());
    }
  }

  // Add sorting parameters
  if (sort) {
    queryParams.append("sort", sort.field || "UpdatedAt");
    queryParams.append("order", sort.order || "desc");
  }
  console.log("qury is ", queryParams.toString());

  // Construct the URL
  const url = `/allcourses?${queryParams.toString()}`;

  try {
    const response = await axios.get(url);
    console.log(response, "urll");
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    // throw error;
    toast.error(
      error instanceof Error ? error.message : "Unable to fetch error"
    );
  }
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
export const purchaseCourse = async (courseId: string, data: any) => {
  try {
    console.log(data, "in regint ");

    return await axios.post("/purchase/" + courseId, {
      data,
    });
  } catch (error) {
    console.log(error.message);

    throw new Error(error.message);
  }
};
export const updateCourseApi = (
  courseId: string,
  data: object,
  deleted?: object
) => {
  return axios.post("/mentor/courseupdate/" + courseId, { data, deleted });
};
export const deleteLessonApi = async (courseId: string, lessonId: string) => {
  await axios.post("/mentor/deletelesson/" + courseId, { lessonId });
  return;
};
export const deleteCourseApi = async (courseid: string) => {
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

export const edtCategory = async (id: string, data: Partial<ICategory>) => {
  try {
    const response = await axios.put("/editCategory/" + id, { data });
    return response;
  } catch (error: any) {
    toast.error(error.message);
    return false;
  }
};
export const actionCategory = async (id: string, type: boolean) => {
  console.log("the type setd is ", type);

  const response = await axios.put("/actionCategory/" + id, { type });
  return response;
};
export const startChat = async (courseid: string) => {
  const id: any = await axios.post("/startchat", { courseid });
  console.log(id);
  return id.roomid;
};
export const getallchat = async (roomid: string) => {
  const data = await axios.get("/getchat/" + roomid);
  console.log(data);
  return data;
};
export const getChatrooms = async (page: number = 1) => {
  const data = await axios.get("/mentor/getchats?page=" + page);
  console.log(data);
  return data;
};
export const requestmeeting = async (a, b, c) => {
  console.log(a, b, c);

  return await axios.post("/requestmeet", {
    mentorId: a,
    scheduledTime: b,
    courseId: c,
  });
};
export const addusertoMeet = async (roomid: string) => {
  return await axios.get("/meeting/" + roomid);
};
export const leaveFrommeet = async (roomid: string) => {
  return await axios.get("/leavemeeting/" + roomid);
};
export const getuserwithperfomence = async (params: string) => {
  return await axios("/mentor/getusers?" + params);
};
// export const makesesstion=async (data)=>{
//   return await axios.post('/makesesstion',{
//     data:data
//   })
// }
export const paymetsuccess = async (qury: string) => {
  axios.post("/paymentsuccess" + qury);
};
export const fetchorders = async (page: number = 1, limit: number = 10) => {
  return await axios.get("/orders?page=" + page + "&limit=" + limit);
};
export const validatequstion = async (
  courseid: string,
  taskid: string,
  answer: string
) => {
  return await axios.post("/course/" + courseid + "/qustionans/" + taskid, {
    answer,
  });
};
export const updateVideoProgress = async (
  courseId: string,
  taskId: string,
  watchTime?: number,
  isCompleted?: boolean,
  response?: string,
  score?: number,
  lessonId?: string
) => {
  // Determine which data to send based on the parameters provided
  const payload: any = {
    courseId,
    taskId,
    lessonId,
  };

  // Add properties conditionally based on task type
  if (watchTime !== undefined) {
    payload.watchTime = watchTime;
    payload.taskType = "Video";
    payload.isCompleted = isCompleted;
  } else if (score !== undefined) {
    payload.score = score;
    payload.isCompleted = isCompleted;
    payload.taskType = "Quiz";
  } else if (response !== undefined) {
    payload.response = response;
    payload.isCompleted = isCompleted;
    payload.taskType = "Assignment";
  } else if (isCompleted !== undefined) {
    payload.isCompleted = isCompleted;
    // If only isCompleted is provided, we need to determine the task type
    // Default to "Quiz" if no other indicators are present
    payload.taskType = "Quiz";
  }
  console.log(payload, "payload is ");

  return await axios.put(`/progress/update-video`, payload);
};
export const markLessonCompleted = async (
  courseId: string,
  lessonId: string
) => {
  return await axios.post(`/progress/mark-completed`, {
    courseId,
    lessonId,
  });
};
export const getProgress = async (courseId: string) => {
  return await axios.get(`/progress/${courseId}`);
};
export const getallreviews = async (courseid: string) => {
  return await axios.get("/getreviews/" + courseid);
};
export const addReview = async (paylod) => {
  return await axios.post("/addreview", paylod);
};
export const savelessonchanges = async (
  lessonid: string,
  data,
  courseId: string
) => {
  await axios.post("/mentor/updatelesson/" + lessonid, { data, courseId });
  return;
};
export const beaMentor = async (data) => {
  const datass = await axios.post("/b-a-mentor", data);
  console.log("respis ", datass);

  return;
};
export const getallrequst = async (url?: string) => {
  console.log(url);

  return await axios.get("/getall-mentor-requst?" + url);
};
export const actionBementor = async (action: string, dataid: string) => {
  await axios.put("/action-be-mentor/" + dataid, { action });
};
export const updateData = async (data) => {
  console.log("up data iddds ", data);

  await axios.put("/update-profile", data);
};
export const changepassword = async ({
  oldPassoword,
  newPassword,
}: {
  oldPassoword: string;
  newPassword: string;
}) => {
  try {
    return await axios.put("/changepassword", { oldPassoword, newPassword });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
export const fetchMentors = () => {
  return [];
};
export const getcertificate = async (courseid: string) => {
  return await axios.get("/certificate/" + courseid);
};
export const reorder = async (orderid: string) => {
  return await axios.get("/reorder/" + orderid);
};
export const totalRevenueRes = async () => {
  return await axios.get("/revenue/total");
};
export const mentorRevenueRes = async () => {
  return await axios.get("/revenue/mentors");
};
export const timeRevenueRes = async (timePeriod: string) => {
  return await axios.get(`/revenue/time?period=${timePeriod}`);
};
export const ordersRes = async (currentPage: number, limit: number = 5) => {
  return await axios.get(`/orders?page=${currentPage}&limit=` + limit);
};
export const getordersMentor = async (page: number = 1, limit: number = 3) => {
  return await axios.get("/mentor/getorders?page=" + page + "&limit=" + limit);
};
export const statesMentor = async () => {
  return await axios.get("/mentor/getstate");
};
export const revenueMentor = async () => {
  return await axios.get("/mentor/getrevenue");
};
export const getMeetings = async (url: string) => {
  console.log(url, "url is ");

  return await axios.get("/mentor/meets?" + url);
};
export const changeStatusMeet = async (status: string, meetid: string) => {
  return await axios.put("/mentor/meetstatus/" + meetid + "?status=" + status);
};
export const updateMeetingTime = async (meetid: string, date: Date) => {
  console.log(date, "date is ");
  await axios.put("/updatetime/" + meetid, { UpdateTime: date });
};
export const getAllcertificate = async (
  page: number,
  limit: number,
  search?: string
) => {
  console.log("inhererererer");
  const url = new URLSearchParams();

  url.append("page", String(page));
  url.append("limit", String(limit));
  if (search) {
    url.append("search", String(search));
  }
  url.toString();
  return await axios.get("/allcertificate?" + url.toString());
};
export const unlistCourse = async (courseid: string) => {
  await axios.put("/mentor/action-course-list?courseid=" + courseid);
};
