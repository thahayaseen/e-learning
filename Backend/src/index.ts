import { server } from './infra/server'
import mongo from './infra/mongoose'

mongo()
server.listen(4050,()=>{
  console.log('servet started at'+4050);
  
})
