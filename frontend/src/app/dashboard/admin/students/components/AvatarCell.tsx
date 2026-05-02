import React from "react";

export function AvatarCell({
  name,
  profileImage,
}: {
  name: string;
  profileImage?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${profileImage ?? "/default-avatar.png"})`,
        }}
      ></div>

      <p className="font-medium text-text-light dark:text-text-dark">{name}</p>
    </div>
  );
}

