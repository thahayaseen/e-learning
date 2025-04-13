import { useState, useEffect } from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Simulated certificate data structure
interface Certificate {
  _id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  category: string;
  completed_date: Date;
}

// Example data for demonstration
const dummyData = [
  {
    _id: "cert1",
    student_id: "student1",
    student_name: "John Doe",
    course_id: "course1",
    course_name: "Introduction to React",
    category: "Web Development",
    completed_date: new Date('2025-03-15')
  },
  {
    _id: "cert2",
    student_id: "student1",
    student_name: "John Doe",
    course_id: "course2",
    course_name: "Advanced JavaScript",
    category: "Programming",
    completed_date: new Date('2025-04-01')
  }
];

export default function CertificatesTab() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // This would be replaced with an actual API call
    // fetchCertificates();
    setCertificates(dummyData);
  }, []);

  const viewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <TabsContent value="certificate" className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Certificates</h2>
        <Button variant="outline">See All Certificates</Button>
      </div>
      
      {certificates.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">You haven't earned any certificates yet. Complete courses to receive certificates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle>{cert.course_name}</CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                </div>
                <CardDescription>{cert.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-2">
                  <span className="font-medium">Completed on:</span> {formatDate(cert.completed_date)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Certificate ID:</span> {cert._id}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => viewCertificate(cert)}
                  className="w-full"
                >
                  View Certificate
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl">Certificate of Completion</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This certifies that
              <p className="text-xl font-serif my-2 text-black">{selectedCertificate?.student_name}</p>
              has successfully completed the course
              <p className="text-xl font-serif my-2 text-black">{selectedCertificate?.course_name}</p>
              <p className="mt-4">Category: {selectedCertificate?.category}</p>
              <p>Completed on: {selectedCertificate && formatDate(selectedCertificate.completed_date)}</p>
              <p className="mt-4 text-sm text-gray-500">Certificate ID: {selectedCertificate?._id}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center">
            <AlertDialogAction>Close</AlertDialogAction>
            <Button variant="outline">Download PDF</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TabsContent>
  );
}