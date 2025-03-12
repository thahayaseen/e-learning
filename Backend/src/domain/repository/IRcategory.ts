import { ICategory } from "../../infra/database/models/Category";

export default interface IRcategory{
    createCategory(name:string,description:string):Promise<ICategory>
    getAllCategory():Promise<ICategory[]>
    deleteCategory(id:string):Promise<void>
    editCategoy(id: string, data: ICategory):Promise<void> 
}