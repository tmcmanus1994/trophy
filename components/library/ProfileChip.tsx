"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/profile";

export function ProfileChip() {
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The image can 404 before hydration, in which case onError never fires —
  // check the already-settled state once mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgFailed(true);
  }, []);

  return (
    <div className="profile-chip">
      <span className="profile-name">{profile.psnId}</span>
      <span className="profile-avatar">
        {imgFailed ? (
          <span className="profile-initials" aria-hidden="true">
            {profile.initials}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={profile.avatar}
            alt=""
            onError={() => setImgFailed(true)}
          />
        )}
      </span>
    </div>
  );
}
