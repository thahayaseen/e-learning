import { AlertCircle, MessageCircle, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Review {
  _id?: string
  title: string
  rating: number
  comment: string
  createdAt: string
  user_id: {
    name: string
  }
}

function ListReview({ reviews }: { reviews: Review[] }) {
  return (
    <div className="bg-white rounded-xl">
      {reviews.length === 0 && (
        <div className="border-t border-gray-100 py-10 flex flex-col gap-3 justify-center items-center bg-gray-50/50 rounded-xl text-center">
          <div className="bg-white p-4 rounded-full shadow-sm">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <span className="text-base text-gray-500 italic max-w-md">
            No reviews yet. Be the first to review this course!
          </span>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageCircle className="text-primary" size={24} />
            </div>
            Student Reviews
            <Badge
              variant="outline"
              className="ml-2 bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1 rounded-full"
            >
              {reviews.length}
            </Badge>
          </h3>

          <div className="space-y-8">
            {reviews.map((item, index) => (
              <div
                key={item._id || index}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out p-6"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" alt={item.user_id?.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {item.user_id?.name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-base">{item.user_id?.name || "Anonymous User"}</h4>
                      <div className="flex items-center mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={`
                              ${i < item.rating ? "text-amber-500" : "text-gray-200"}
                              ${i < item.rating ? "fill-amber-500" : "fill-transparent"}
                              mr-0.5
                            `}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-2.5 font-medium">{item.rating}/5 Rating</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-full">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {item.title && <h5 className="text-base font-semibold text-gray-700 mb-3">{item.title}</h5>}

                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  {item.comment}
                </p>

                {index < reviews.length - 1 && <Separator className="mt-6 bg-gray-100" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ListReview

