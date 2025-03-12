
import mentrorouter from '../presentation/routers/mentor'
import mentor from '../presentation/routers/user'
import {Router} from 'express'
const router=Router()

router.use('/',mentor)
router.use('/mentor',mentrorouter)
export default router