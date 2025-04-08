interface IRevenueRepository {
  getTotalRevenue(): Promise<number>;
  getAdminRevenue(): Promise<number>;
  getMentorRevenue(): Promise<Array<MentorRevenue>>;
  getTimeRevenue(
    timePeriod: "daily" | "weekly" | "monthly"
  ): Promise<Array<TimeRevenue>>;
  getMentorRevenueById(mentorId: string): Promise<MentorRevenueById>;
  getMentorTimeRevenue(
    mentorId: string,
    timePeriod: "daily" | "weekly" | "monthly"
  ): Promise<Array<TimeRevenue>>;
}

interface MentorRevenue {
  _id: string;
  mentorName: string;
  totalAmount: number;
  orderCount: number;
  totalRevenue: number;
}

interface TimeRevenue {
  _id: string;
  revenue: number;
}

interface MentorRevenueById {
  totalRevenue: number;
  orderCount: number;
}

export default IRevenueRepository;
