"use client";
import { paymetsuccess } from "@/services/fetchdata";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PaymentSuccess = () => {
  const path = new URLSearchParams(window.location.search);
  const router = useRouter();
  console.log(path);
  const qury = path.get("session_id");
  const status = path.get("status") === "true";

  console.log(qury);

  // Redirect after 5 seconds
  setTimeout(() => {
    router.push("/");
  }, 5000);

  useEffect(() => {
    let timeoutId;
    const fn = async () => {
      const orderid = localStorage.getItem("orderid");
      if (!qury || !orderid) return; // Avoid unnecessary calls if values are missing

      // Debouncing to prevent multiple calls
      timeoutId = setTimeout(async () => {
        await paymetsuccess(
          `?session_id=${qury}&orderid=${orderid}&status=${status}`
        );
        localStorage.removeItem("orderid");
      }, 300); // Wait 300ms before executing

    };

    fn();

    return () => {
      clearTimeout(timeoutId); // Cleanup in case of unmount
    };
  }, []); // Empty dependency array ensures it runs only once

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{status ? "Payment Successful! ✅" : "Payment Failed!"}</h2>
      <p>You can close this page if it doesn't close automatically.</p>
    </div>
  );
};

export default PaymentSuccess;
