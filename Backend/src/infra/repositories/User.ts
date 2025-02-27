import IUser, { Alluserinterface } from "../../app/repository/IUser";
import UserModel, { IUserModel } from "../database/models/User";
import catchAsync from "../../utils/catechAsync";
import User from "../../domain/entities/UserSchema";

import bcrypt from "bcrypt";
import AdminUserDTO from "../../app/dtos/adminDTOUsers";
import { UserDTO } from "../../app/dtos/Duser";

export default class UserRepository implements IUser {
  constructor() {}
  create = catchAsync(async (users: IUserModel): Promise<UserDTO|null> => {
     await UserModel.create(users);
     return null
  });

  changepass = catchAsync(
    async (id: string, password: string): Promise<void> => {
      console.log(typeof password, "pass is ", id);
      const pass = await bcrypt.hash(password, 10);
      console.log('hashed');
      
      console.log(pass,'password');

      await UserModel.updateOne({ _id: id }, { password: pass });
      console.log('updated');
      
      return 
    }
  );

  findByEmail = catchAsync(
    async (email: string): Promise<UserDTO | null> => {
      // console.log(email);

      return await UserModel.findOne({ email: email });
    }
  );
  updatagid = catchAsync(async (id: string, gid: string):Promise<UserDTO|null> => {
    return await UserModel.findOneAndUpdate({ _id: id }, { gid });
  });

  updateName = catchAsync(
    async (name: string, id: string): Promise<UserDTO | null> => {
      return await UserModel.findOneAndUpdate(
        { _id: id },
        { name: name },
        { new: true }
      );
    }
  );
  findAlluser = catchAsync(async (limit:number,skip:number):Promise<Alluserinterface>=> {
   const data= await UserModel.find({}).skip(skip).limit(limit)
   
  //  const formattedData = data.map(user => new AdminUserDTO(user._id as number,user.name,user.email,user.role,user.isblocked,String(user.updatedAt )));
  const formattedData = data.map(user => Object.assign({}, new AdminUserDTO(user._id as number,user.name,user.email,user.role,user.isblocked,String(user.updatedAt )))); 
  console.log(formattedData,"formdatasis");
   
   const toatal=await UserModel.countDocuments()
   const totalpages=Math.ceil(toatal/ limit)
   return {formattedData,totalpages}
  });
 
  verify = catchAsync(async (id: string): Promise<void> => {
    await UserModel.updateOne({ _id: id }, { verified: true });
  });

  findByid = catchAsync(async (id: string): Promise<UserDTO | null> => {
    return await UserModel.findById(id);
    // const { name, email, gid, isblocked, password, profile, purchasedCourses, role, subscription, verified } = data;
    //  const Users=new User(name,email,profile,gid,password,isblocked,purchasedCourses,role,subscription,verified)
      
  });

  hashpass = catchAsync(async function (
    this: UserRepository,
    pass: string
  ): Promise<string> {
    return bcrypt.hash(pass, 10);
  });
  Hmatch = catchAsync(
    async (Upass: string, Hpass: string): Promise<boolean> => {
      console.log(Upass, Hpass, "jere");

      return bcrypt.compare(Upass, Hpass);
    }
  );
  Blockuser = catchAsync(
    async (id: string,type:boolean): Promise<void> => {
    await UserModel.updateOne({_id:id},{isblocked:type})
    }
  );
}
