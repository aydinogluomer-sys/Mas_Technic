import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MusteriSidebar } from "./MusteriSidebar";
import { useState } from "react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  displayName: string;
  userEmail: string;
  onLogout: () => void;
}

export const MusteriMobileSidebar = ({ activeTab, onTabChange, displayName, userEmail, onLogout }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden text-slate-400 hover:text-[#0AA2CD] transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 dark:bg-[#0F172A] bg-white border-r dark:border-[#334155] border-slate-200">
        <VisuallyHidden>
          <SheetTitle>Navigasyon Menüsü</SheetTitle>
          <SheetDescription>Müşteri panel navigasyonu</SheetDescription>
        </VisuallyHidden>
        <MusteriSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            onTabChange(tab);
            setOpen(false);
          }}
          collapsed={false}
          displayName={displayName}
          userEmail={userEmail}
          onLogout={onLogout}
        />
      </SheetContent>
    </Sheet>
  );
};
