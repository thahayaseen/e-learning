export default class AdminUserDTO {
    id: number;
    name: string;
    email: string;
    role: string;
    blocked: boolean;
    lastActive: string;
  
    constructor(id: number, name: string, email: string, role: string, blocked: boolean, lastActive: string) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.role = role;
      this.blocked = blocked;
      this.lastActive = new Date(lastActive).toISOString().replace("T", " ").split(".")[0];
    }
  }
  
