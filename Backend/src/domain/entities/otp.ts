export default class Otp {
    private otp: number;
    private expiresAt: Date; 

    constructor(private userId: string) {
        this.otp = this.generateOtp();
        this.expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
    }

    private generateOtp(): number {
        return Math.floor(100000 + Math.random() * 900000); 
    }

    getOtp(): number {
        return this.otp;
    }

    getExpiry(): Date {
        return this.expiresAt;
    }
}
