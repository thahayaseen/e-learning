import axios from '@/services/asios';

export const getusers=async()=>{
    const data=await axios.get('/allusers')
    return data
}