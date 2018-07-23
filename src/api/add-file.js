import { CONTAINER_NAME } from "../config";
import upload from "../lib/upload";

const addFile = (context, blobService) => {
    upload(context, blobService, CONTAINER_NAME);
};
export default addFile;
