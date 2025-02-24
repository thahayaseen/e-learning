import axios from '@/services/asios'


export default async function GET(req, res) {
    console.log();
    
    const data=axios.get(`/allusers?page=${page}&limit${5}`)
    const users=data
    console.log(users);
    
  return users
}


