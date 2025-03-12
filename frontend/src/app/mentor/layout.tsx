import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/mentor/MentorsidebarComponent";
import { Toaster } from "@/components/ui/sonner";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider >
      <AppSidebar />
      <Toaster />
  
      {children}
    </SidebarProvider>
  );
}
