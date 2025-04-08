// src/usecases/revenue.usecase.js
import IRevenueRepository from "../../domain/repository/Irevenue.repositroy";

export class RevenueUseCase {
  constructor(private revenueRepository: IRevenueRepository) {}
  async getTotalRevenue() {
    return await this.revenueRepository.getTotalRevenue();
  }

  async getMentorRevenue() {
    return await this.revenueRepository.getMentorRevenue();
  }

  async getTimeRevenue(timePeriod: "daily" | "weekly" | "monthly") {
    return await this.revenueRepository.getTimeRevenue(timePeriod);
  }

  async getMentorRevenueById(mentorId: string) {
    return await this.revenueRepository.getMentorRevenueById(mentorId);
  }

  async getMentorTimeRevenue(
    mentorId: string,
    timePeriod: "daily" | "weekly" | "monthly"
  ) {
    return await this.revenueRepository.getMentorTimeRevenue(
      mentorId,
      timePeriod
    );
  }

  async getAdminRevenue() {
    return await this.revenueRepository.getAdminRevenue();
  }
}

export default RevenueUseCase
