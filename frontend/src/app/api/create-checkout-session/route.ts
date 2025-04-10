import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const requestData = await request.json();

  try {
    // Create a checkout session
    console.log(requestData, "data isssdd");

    const session = await stripe.checkout.sessions.create({
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
      success_url: `https://${process.env.NEXT_PUBLIC_SERVER}/paymentsuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://${process.env.NEXT_PUBLIC_SERVER}/courses/${requestData.courseId}`,
      metadata: {
        courseId: requestData.courseId,
        planType: requestData.planType,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    // if()
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "Unexpected Error",
        },
      },
      { status: 500 }
    );
  }
}
