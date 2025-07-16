import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
// You will need to update the import path below if you move the file router
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
