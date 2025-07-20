"use client";
import { useUser } from "@clerk/nextjs";
import UploadContent from "./UploadContent";

export default function UploadPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  // Check for role in publicMetadata
  const role = user?.publicMetadata?.role;
  const allowedRoles = ["admin", "uploader"];

  console.log("User metadata:", user?.publicMetadata);
  console.log("User ID:", user?.id);

  if (!isSignedIn || !allowedRoles.includes(role)) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#b91c1c",
          fontWeight: 600,
        }}
      >
        Access Denied. You do not have permission to upload questions.
      </div>
    );
  }

  return <UploadContent />;
}
