"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import Image from "next/image";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const UserAvatar = ({
  imgSrc,
  className,
}: {
  imgSrc: string;
  className?: string;
}) => {
  return (
    <Avatar className={cn("rounded-full cursor-pointer", className)}>
      {imgSrc ? (
        <div className="w-full h-full">
          <Image
            src={imgSrc}
            alt="プロフィール画像"
            width={40}
            height={40}
            onError={(e) => console.error("Image load error:", e)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export { Avatar, AvatarImage, AvatarFallback, UserAvatar };
