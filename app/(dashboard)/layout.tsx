"use client";

import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openStatus } = useSidebarStore();
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  useAuth();

  return (
    <SidebarProvider open={openStatus}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex text-white h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 text-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                  const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                  const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
                  const isLast = index === pathSegments.length - 1;

                  return (
                    <BreadcrumbItem key={segment} className="hidden md:flex">
                      {isLast ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                          <BreadcrumbSeparator className="hidden md:block" />
                        </>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
