export interface Imentorrequst {
    fullname: string;
    userid: string;
    idproof: string;
    mobile: string;
    qualification: string;
    experience: number;
    profileLink: string;
    startTime: string;
    endTime: string;
    profileImage: string;
    status: "pending" | "rejected" | "accepted";
  }