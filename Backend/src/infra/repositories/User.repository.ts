import IUser, { Alluserinterface } from "../../domain/repository/IUser.repository";
import UserModel, { IUserModel } from "../database/models/User";
import catchAsync from "../../utils/catechAsync";
import User from "../../domain/entities/UserSchema";

import bcrypt from "bcrypt";
import AdminUserDTO from "../../app/dtos/adminDTOUsers";
import { UserDTO } from "../../app/dtos/Duser";
import Courses from "../database/models/course";
import { OrderSchemas } from "../database/models/order";
import { Roles } from "../../app/useCases/enum/User";

export default class UserRepository implements IUser {
  
  constructor() {}
  create = catchAsync(async (users: IUserModel): Promise<UserDTO | null> => {
 
    const userdata = await UserModel.create(users);
    const obj: UserDTO = {
      name: userdata.name,
      email: userdata.email,
      _id: userdata._id as string,
      isBlocked: userdata.isBlocked,
      gid: userdata.gid,
      profile: userdata.profile,
      purchasedCourses: userdata.purchasedCourses,
      role: userdata.role,
      subscription: userdata.subscription,
      verified: userdata.verified,
    };

    return obj;
  });

  changepass = catchAsync(
    async (id: string, password: string): Promise<void> => {
 
      const pass = await bcrypt.hash(password, 10);
 

 

      await UserModel.updateOne({ _id: id }, { password: pass });
 

      return;
    }
  );

  findByEmail = catchAsync(async (email: string): Promise<UserDTO | null> => {
 
    const userdata = await UserModel.findOne({ email: email });
    if (!userdata) {
      return null;
    }
    const obj: UserDTO = {
      name: userdata.name,
      email: userdata.email,
      _id: userdata._id as string,
      isBlocked: userdata.isBlocked,
      gid: userdata.gid,
      profile: userdata.profile,
      purchasedCourses: userdata.purchasedCourses,
      role: userdata.role,
      subscription: userdata.subscription,
      verified: userdata.verified,
      password: userdata.password,
      username: userdata.username,
      CreatedAt:userdata.createdAt
    };
    return obj;
  });
  updatagid = catchAsync(
    async (id: string, gid: string): Promise<UserDTO | null> => {
      return await UserModel.findOneAndUpdate({ _id: id }, { gid });
    }
  );

  updateName = catchAsync(
    async (name: string, id: string): Promise<UserDTO | null> => {
      return await UserModel.findOneAndUpdate(
        { _id: id },
        { name: name },
        { new: true }
      );
    }
  );
  findAlluser = catchAsync(
    async (
      limit: number,
      skip: number,
      filter: any = {},
      sort: any
    ): Promise<Alluserinterface> => {
 

      const data = await UserModel.find(filter)
        .populate("purchasedCourses")
        .skip(skip)
        .limit(limit)
        .select("_id name email role isBlocked updatedAt")
        .lean();

      //  const formattedData = data.map(user => new AdminUserDTO(user._id as number,user.name,user.email,user.role,user.isblocked,String(user.updatedAt )));
 

      const toatal = await UserModel.countDocuments(filter);
      const totalpages = Math.ceil(toatal / limit);
      return { formattedData: data, totalpages };
    }
  );

  verify = catchAsync(async (id: string): Promise<void> => {
    await UserModel.updateOne({ _id: id }, { verified: true });
  });

  findByid = catchAsync(async (id: string): Promise<UserDTO | null> => {
    const userdata = await UserModel.findById(id);
    if (!userdata) {
      return null;
    }
    const obj: UserDTO = {
      name: userdata.name,
      email: userdata.email,
      _id: userdata._id as string,
      isBlocked: userdata.isBlocked,
      gid: userdata.gid,
      profile: userdata.profile,
      purchasedCourses: userdata.purchasedCourses,
      role: userdata.role,
      subscription: userdata.subscription,
      verified: userdata.verified,
      updatedAt: String(userdata.updatedAt),
      password: userdata.password,
    };
    return obj;
  });

  hashpass = catchAsync(async function (
    this: UserRepository,
    pass: string
  ): Promise<string> {
    return bcrypt.hash(pass, 10);
  });
  Hmatch = catchAsync(
    async (Upass: string, Hpass: string): Promise<boolean> => {
 

      return bcrypt.compare(Upass, Hpass);
    }
  );
  Blockuser = catchAsync(async (id: string, type: boolean): Promise<void> => {
    await UserModel.updateOne({ _id: id }, { isBlocked: type });
  });
  // finduserBymentor = catchAsync(
  //   async (mentor: string, limit: number, skip: number): Promise<UserDTO[]> => {
  //     const data = await Courses.find({ purchasedCourses: { $in: [mentor] } })
  //       .skip(skip)
  //       .limit(limit);
  //     const obj: UserDTO[] = data.map((dat) => ({
  //       _id: dat._id as string,
  //       name: dat.name,
  //       email: dat.email,
  //       isBlocked: dat.isBlocked,
  //       profile: dat.profile,
  //       purchasedCourses: dat.purchasedCourses,
  //       subscription: dat.subscription,
  //       updatedAt: String(dat.updatedAt),
  //       verified: dat.verified,
  //     }));
  //     return obj;
  //   }
  // );
  async addCourseInstudent(userId: string, courseId: string) {
    await UserModel.updateOne(
      { _id: userId },
      { $push: { purchasedCourses: courseId } } // Correct placement of `$push`
    );
    return;
  }
  async changeUserdata(userid: string, data: any): Promise<void> {
    const qury: any = {};

    if (data.name) {
      qury["name"] = data.name.trim();
    }

 

    if (data["profile.social_link"]) {
 
      qury["profile.social_link"] = data["profile.social_link"];
    }

    if (data.avathar) {
      qury["profile.avatar"] = data.avathar;
    }

 

    const datass = await UserModel.findByIdAndUpdate(
      userid,
      { $set: qury }, // Update only the specific fields
      { new: true }
    );

 
  }
  async getAllorders(
    userId: string,
    page: number,
    limit: number
  ): Promise<any> {
 
    
    const orders = await OrderSchemas.find({ userId: userId })
      .populate("userId", "name email") // Select specific user fields
      .populate("courseId", "Title")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // Latest orders first
    const totalCount = await OrderSchemas.countDocuments({ userId: userId });
    return { orders, totalCount };
  }
  async changeUserRole(userid:string,role:'mentor'|'admin'|'user'):Promise<void>{
    await UserModel.findByIdAndUpdate(userid,{role})
    return 
  } 
}
