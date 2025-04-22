import { Response } from "express";
import { AuthServices } from "./user.controller";
import { ICourseUseCase } from "../../domain/interface/courseUsecase";
import Stripe from "stripe";
import { orderDto } from "../../app/dtos/orderDto";

import { SystemError } from "../../app/useCases/enum/systemError";
import { IuserUseCase } from "../../domain/interface/IUseruseCase";
import { HttpStatusCode } from "../../app/useCases/enum/Status";
import { handleError } from "../../utils/handleerror";

export class Ordercontroller {
  private stripe;

  constructor(
    private CourseUseCase: ICourseUseCase,
    private userUseCase: IuserUseCase
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  async reOrder(req: AuthServices, res: Response) {
    const { _id } = req.user;
    const { orderid } = req.params;
    console.log(orderid, "oid is ");

    if (!_id) {
      throw new Error("User not found");
    }
    if (!orderid) {
      throw new Error("Order not found");
    }
    const data = await this.CourseUseCase.repayOrder(_id, orderid);
    if (!data.sessionId) {
      throw new Error("cannot get the order");
    }
    const session = await this.stripe.checkout.sessions.retrieve(
      data.sessionId
    );
    console.log(session);

    res.status(200).json({
      success: true,
      message: "created",
      url: session.url,
      id: session.id,
    });
  }
  async paymentsuccss(req: AuthServices, res: Response) {
    try {
      const { _id, purchasedCourses } = req.user;
      const sesstion = req.query.session_id;
      const orderid = req.query.orderid;
      const status = req.query.status == "true";
      console.log(orderid, "oid is ", status);
      if (!orderid) {
        throw new Error("Order id cannot Found");
      }

      const data = await this.stripe.checkout.sessions.listLineItems(
        String(sesstion)
      );
      const session = await this.stripe.checkout.sessions.retrieve(
        String(sesstion)
      );
      console.log(session);
      const courseid = session.metadata?.courseId;
      console.log(courseid);
      if (!courseid) {
        throw new Error("Cannot Find Course");
      }
      console.log(purchasedCourses, courseid, "datassd");

      if (purchasedCourses.includes(String(courseid))) {
        throw new Error("User aldredy purchased");
      }
      let updata: Partial<orderDto> = {
        paymentStatus: status ? "paid" : "failed",
        paymentId: String(session.payment_intent),
      };

      const result = await this.CourseUseCase.Conformpayment(
        updata,
        String(orderid)
      );
      console.log(result, "resut is ");

      await this.CourseUseCase.purchaseCourse(
        String(result?.userId),
        result.courseId
      );

      console.log("Course ID:", session.metadata?.courseId); // Access stored metadata
      console.log("Plan Type:", session.metadata?.planType);
    } catch (error: any) {
      console.log(error, "the error is ");

      res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ message: error.message || "Failed" });
    }
  }
  async stripeSesstion(req: AuthServices, res: Response) {
    try {
      const requestData = req.body.data;
      console.log(requestData);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: requestData.courseName,
              },
              unit_amount: requestData.price * 100, // Stripe expects amount in cents/paise
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://${process.env.NEXT_PUBLIC_SERVER}/paymentsuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://${process.env.NEXT_PUBLIC_SERVER}/courses/${requestData.courseId}`,
        metadata: {
          courseId: requestData.courseId,
          planType: requestData.planType,
        },
      });
      res.status(200).json({
        success: true,
        message: "created",
        url: session.url,
        id: session.id,
      });
      return;
    } catch (error: any) {
      console.log(error.message);
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: SystemError.SystemError,
      });
    }
  }
  async BuyCourse(req: AuthServices, res: Response) {
    try {
      let userId;
      const { email, _id } = req.user;
      const { courseId } = req.params;
      if (!courseId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Not Found",
        });
        return;
      }
      const requestData = req.body.data;
      console.log(requestData);
      console.log(req.user);

      if (!_id || !email) {
        throw new Error("cannot get uesr data");
      }

      const user = await this.userUseCase.UseProfileByemail(email);
      if (user?.purchasedCourses?.includes(courseId)) {
        res.status(HttpStatusCode.CONFLICT).json({
          success: false,
          message: "Student aldredy purchased",
        });
        return;
      }
      await this.CourseUseCase.checkOrderDupication(_id, courseId, true);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: requestData.courseName,
              },
              unit_amount: requestData.price * 100, // Stripe expects amount in cents/paise
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_SERVER}/paymentstatus?status=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SERVER}/paymentstatus?status=false&session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          courseId: requestData.courseId,
          planType: requestData.planType,
        },
      });
      let results = await this.CourseUseCase.checkOrderDupication(
        _id,
        courseId,
        false
      );
      if (!results) {
        results = await this.CourseUseCase.createOrder({
          amount: requestData.price,
          courseId: requestData.courseId,
          currency: "inr",
          planType: requestData.planType,
          userId: _id,
          paymentId: String(session.payment_intent),
          sessionId: session.id,
        });
      }
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "order created ",
        url: session.url,
        id: session.id,
        orderid: results._id,
      });
      return;
    } catch (error: any) {
      console.log(error.message);

      handleError(
        res,
        error || "An error occupied",
        HttpStatusCode.BAD_REQUEST
      );
    }
  }
}
