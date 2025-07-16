import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Dummy auth function, replace with real auth if needed
const auth = async (req: Request) => {
  // You can extract user info from cookies/session here
  return { id: "anonymous" };
};

export const ourFileRouter = {
  documentUploader: f([
    "pdf",
    "image",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ])
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // You can save file info to your DB here if needed
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId, url: file.url, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
