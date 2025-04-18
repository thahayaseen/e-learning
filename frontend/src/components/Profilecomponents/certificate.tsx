import { TabsContent } from "@/components/ui/tabs";
import { UserDTO } from "@/services/interface/CourseDto";
// import { CertificateDTO } from "@/services/interface/CertificateDto";
import {
  Award,
  Calendar,
  Download,
  ExternalLink,
  Search,
  FileText,
  GraduationCap,
  Book,
} from "lucide-react";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { getAllcertificate } from "@/services/fetchdata";
import CertificateDisplay from "../course/certificta";
import { useRouter } from "next/navigation";
import PaginationComponent from "../default/pagination";
import { Debouncing } from "@/services/debauncing";

interface CertificateProps {
  userData?: UserDTO;
}
const limit = 1;
export function Certificates({ userData }: CertificateProps) {
  const [search, setSearch] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState<any[]>([]);
  const [page, Setpage] = useState(1);
  const [total, setTotal] = useState(1);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const fn = async () => {
        console.log("herere reootooo");

        const data: any = await getAllcertificate(page, limit, search);
        console.log(data, "dataid sidididdiiddi");
        setCertificates(data.data);
        setTotal(data.total);
      };

      fn();
    }, 500); // debounce delay: 500ms

    return () => clearTimeout(timeout); // cleanup to cancel the previous timeout
  }, [page, search]);
  // Function to get category badge color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "programming":
        return "bg-blue-500";
      case "frontend":
        return "bg-green-500";
      case "backend":
        return "bg-purple-500";
      case "database":
        return "bg-orange-500";
      default:
        return "bg-[#5CDB95]";
    }
  };
  const router = useRouter();
  return (
    <div
   
      className="space-y-6 bg-[#0a192f] min-h-screen p-6 rounded-xl">
      <Card className="bg-[#112240] border-[#1a2b4a] rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-[#1a2b4a] bg-gradient-to-br from-[#0a192f] to-[#112240] p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#5CDB95] font-bold text-xl">
                Your Certificates
              </CardTitle>
              <CardDescription className="text-[#8892b0] mt-2">
                View and download your course completion certificates
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#8892b0]" />
                <Input
                  type="text"
                  placeholder="Search certificates..."
                  className="pl-8 bg-[#0a192f] border-[#1a2b4a] text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!certificates || certificates.length === 0 ? (
            <div className="text-center py-10">
              <Award className="h-16 w-16 mx-auto text-[#5CDB95] opacity-50" />
              <p className="text-[#8892b0] mt-4">
                You don't have any certificates yet. Complete a course to earn
                your first certificate!
              </p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-16 w-16 mx-auto text-[#5CDB95] opacity-50" />
              <p className="text-[#8892b0] mt-4">
                No certificates match your search. Try a different keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {certificates.map((certificate) => (
                <div
                  key={certificate._id}
                  className="bg-[#0a192f] p-5 rounded-xl  border border-[#1a2b4a] 
                    transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <Badge
                      className={`${getCategoryColor(
                        certificate.category
                      )} text-white`}>
                      {certificate.category}
                    </Badge>
                    <Award className="h-6 w-6 text-[#5CDB95]" />
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2">
                    {certificate.course_name}
                  </h3>

                  <div className="flex items-center text-[#8892b0] mb-1">
                    <Book className="h-4 w-4 mr-2 text-[#5CDB95]" />
                    <span>{certificate.student_name}</span>
                  </div>

                  <div className="flex items-center text-[#8892b0] mb-4">
                    <Calendar className="h-4 w-4 mr-2 text-[#5CDB95]" />
                    <span>
                      Completed:{" "}
                      {format(
                        new Date(certificate.completed_date),
                        "MMM dd, yyyy"
                      )}
                    </span>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={(e) =>
                        router.push("/course/view/" + certificate.course_id)
                      }
                      className="px-4 py-2 bg-[#1a2b4a] text-[#5CDB95] rounded-md 
                        hover:bg-[#5CDB95] hover:text-[#112240] 
                        transition-all duration-300 flex items-center gap-2 w-1/2 justify-center">
                      <ExternalLink className="h-4 w-4" /> See Course
                    </button>
                    <CertificateDisplay {...certificate} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificate Statistics */}
      <Card className="bg-[#112240] border-[#1a2b4a] rounded-xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-[#0a192f] to-[#112240] p-6">
          <CardTitle className="text-[#5CDB95] font-bold text-xl">
            Certificate Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a]">
              <h3 className="text-sm font-medium text-[#8892b0] mb-3">
                Total Certificates
              </h3>
              <p className="text-white flex items-center gap-2 text-2xl font-bold">
                <Award className="h-6 w-6 text-[#5CDB95]" />
                {certificates ? total : 0}
              </p>
            </div>
            <div className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a]">
              <h3 className="text-sm font-medium text-[#8892b0] mb-3">
                Latest Certificate
              </h3>
              <p className="text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#5CDB95]" />
                {certificates && certificates.length > 0
                  ? certificates.sort(
                      (a, b) =>
                        new Date(b.completed_date).getTime() -
                        new Date(a.completed_date).getTime()
                    )[0].course_name
                  : "No certificates yet"}
              </p>
            </div>
            <div className="bg-[#0a192f] p-5 rounded-xl border border-[#1a2b4a]">
              <h3 className="text-sm font-medium text-[#8892b0] mb-3">
                Most Recent Completion
              </h3>
              <p className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#5CDB95]" />
                {certificates && certificates.length > 0
                  ? format(
                      new Date(
                        certificates.sort(
                          (a, b) =>
                            new Date(b.completed_date).getTime() -
                            new Date(a.completed_date).getTime()
                        )[0].completed_date
                      ),
                      "MMMM dd, yyyy"
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <PaginationComponent
        itemsPerPage={limit}
        page={page}
        setPage={Setpage}
        total={total}
      />
    </div>
  );
}
