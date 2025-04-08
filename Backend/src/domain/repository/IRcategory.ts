import { ICategory } from "../../infra/database/models/Category";

export default interface IRcategory{
    createCategory(name:string,description:string):Promise<ICategory>
    getAllCategory():Promise<ICategory[]>
    action(id:string,action:boolean):Promise<void>
    editCategoy(id: string, data: ICategory):Promise<void> 
    getCategorywithname(name:string):Promise<ICategory|null>
}