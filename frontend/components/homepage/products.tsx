import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Image from "next/image";
import { Badge } from '../ui/badge';
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Explore } from "../mybtns/myBtns";

interface ProductDetails {
  category: string;
  orderCount: number;
  smallDiscroption: string;
  price: string;
  id: string;
  url: string;
  rating?: number;
}

function Products({ category, orderCount, smallDiscroption, price, id, url, rating = 4.5 }: ProductDetails) {
  const isBestSeller = orderCount > 50;
  
  return (
    <Card className="overflow-hidden bg-gray-800 border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-indigo-500/20 group">
      <div className="relative h-56 w-full bg-indigo-900 overflow-hidden">
        <Image
          src={url || '/default.png'}
          width={500}
          height={500}
          alt={category}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {isBestSeller && (
          <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Star className="w-3 h-3 mr-1 fill-current" />
            BEST SELLER
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className="bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/60">
            {isBestSeller ? 'Best Seller' : 'New Arrival'}
          </Badge>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} 
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">{rating}</span>
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-white mt-2">{category}</CardTitle>
        <CardDescription className="text-gray-400 line-clamp-2">
          {smallDiscroption}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2"></div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Price</span>
          <div className="text-xl font-bold text-indigo-400">{price}₹</div>
        </div>
        <div className="flex gap-2">
         
          <Explore _id={id} />
        </div>
      </CardFooter>
    </Card>
  );
}

export default Products;