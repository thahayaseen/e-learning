import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, LinkIcon, Download, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Resource {
  id: string;
  title: string;
  type: "pdf" | "link" | "code" | "video";
  url: string;
  description?: string;
  size?: string;
}

interface CourseResourcesProps {
  resources: Resource[];
  className?: string;
}

export function CourseResources({ resources, className = "" }: CourseResourcesProps) {
  // Helper function to render the appropriate icon based on resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "link":
        return <LinkIcon className="h-4 w-4 text-blue-500" />;
      case "code":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "video":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Helper function to get badge color based on resource type
  const getResourceBadgeClass = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-50 text-red-700 border-red-200";
      case "link":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "code":
        return "bg-green-50 text-green-700 border-green-200";
      case "video":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className={`shadow-md border-gray-100 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Additional Resources</CardTitle>
        <CardDescription>Helpful materials to support your learning</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {resources.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            No additional resources available for this course yet.
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-start p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <div className="mr-3 mt-1">{getResourceIcon(resource.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-800 truncate">{resource.title}</h4>
                    <Badge variant="outline" className={getResourceBadgeClass(resource.type)}>
                      {resource.type.toUpperCase()}
                    </Badge>
                  </div>
                  {resource.description && (
                    <p className="text-xs text-gray-600 mb-2">{resource.description}</p>
                  )}
                  {resource.size && (
                    <p className="text-xs text-gray-500">{resource.size}</p>
                  )}
                </div>
                <div className="ml-4">
                  {resource.type === "link" ? (
                    <Link href={resource.url} target="_blank" passHref>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open link</span>
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                      <Link href={resource.url} download>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
