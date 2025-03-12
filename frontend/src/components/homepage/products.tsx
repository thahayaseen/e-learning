import React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import { Badge } from '@/components/ui/badge';

import { Button } from "../ui/button";
import { Explore } from "../mybtns/myBtns";
interface Productdetials {
  category: string;
  orderCount: number;
  smallDiscroption: string;
  price: string;
  id: string;
  url: string;
}
function Products(data: Productdetials) {
  return (
    <Card className="bg-gray-800 border-gray-700 transition-all hover:-translate-y-2">
      <div className="h-56 w-full bg-indigo-900 rounded-t-lg overflow-hidden">
        <Image
          src={data.url||'/default.png'}
          width={100}
          height={100}
          alt="image"
         className="h-full w-full"
        />
        ;
      </div>
      <CardHeader>
        <Badge className="w-fit mb-2 bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/60">
         {data.orderCount>50?' Best Seller':'New arrivals'}
        </Badge>
        <CardTitle className="text-xl">{data.category}</CardTitle>
        <CardDescription className="text-gray-400">
          {data.smallDiscroption}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="text-lg font-bold text-indigo-400">{data.price}₹</div>
      <Explore _id={data.id}/>
      </CardFooter>
    </Card>
  );
}

export default Products;
