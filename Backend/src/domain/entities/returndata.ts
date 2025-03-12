import { ICourses } from "../../infra/database/models/course";

export interface CourseInterface{
    data:ICourses[],
    total:number
}