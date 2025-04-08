import { Router,Request ,Response} from "express";
import { controller, mentorController } from "../service/controler.config";
import { jwtVerify } from "../middilwere/varify";
import uploads from "../service/multer";
const router=Router()
router.get('/categorys',mentorController.getcategorys.bind(mentorController))
router.post('/addcourse',jwtVerify,mentorController.createCourses.bind(mentorController))
router.get('/courses',jwtVerify,mentorController.getCourses.bind(mentorController))
router.post('/lessons',jwtVerify,mentorController.controlergetLesson.bind(mentorController))
router.post('/action/:id',jwtVerify,mentorController.applayAction.bind(mentorController))
router.post('/courseupdate/:courseid',jwtVerify,mentorController.updateCoursecontroler.bind(mentorController))
router.post('/deletelesson/:id',jwtVerify,mentorController.deleteLesson.bind(mentorController))
router.post('/addTask/:lessonid',jwtVerify,mentorController.addTask.bind(mentorController))
router.post('/updatetask/:taskid',jwtVerify,mentorController.updateTask.bind(mentorController))
router.post('/updatelesson/:lessonid',jwtVerify,mentorController.updataLesson.bind(mentorController))
router.post('/addlesson',jwtVerify,mentorController.addlesson.bind(mentorController))
router.post('/course/delete',jwtVerify,mentorController.deleteCourse.bind(mentorController))
router.post('/task/delete',jwtVerify,mentorController.DeleteTask.bind(mentorController))
router.get('/getchats',jwtVerify,mentorController.getRoomsByid.bind(mentorController))
router.get('/getusers',jwtVerify,mentorController.studentManagment.bind(mentorController))
router.get('/getorders',jwtVerify,mentorController.getorderMentorId.bind(mentorController))
router.get('/getrevenue',jwtVerify,mentorController.getRevenue.bind(mentorController))
router.get('/getstate',jwtVerify,mentorController.getState.bind(mentorController))
router.get('/meets',jwtVerify,mentorController.getMeetings.bind(mentorController))
router.put('/meetstatus/:meetid',jwtVerify,mentorController.updateMeetingStatus.bind(mentorController))


export default router