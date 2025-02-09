import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
interface CommonCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  toggle?: () => void;
  isOpen?: boolean;
}

export const CommonCard = ({
  title,
  icon,
  children,
  toggle,
  isOpen,
}: CommonCardProps) => {
  return (
    <Card className="border shadow-none dark:bg-background dark:border-gray-500">
      <CardHeader className="py-4">
        <CardTitle
          className={`text-sm text-muted-foreground flex items-center justify-between ${
            toggle ? "cursor-pointer" : ""
          }`}
          onClick={toggle}
        >
          {icon ? (
            <div className="flex items-center gap-2 dark:text-white">
              {icon}
              {title}
            </div>
          ) : (
            title
          )}
          {toggle && (
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </CardTitle>
      </CardHeader>
      {isOpen && <CardContent className="space-y-2">{children}</CardContent>}
    </Card>
  );
};
