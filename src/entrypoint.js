import storage from "azure-storage";

import addFileApi from "./api/add-file";
import getFileApi from "./api/get-file";

const blobService = storage.createBlobService();

export function addFile(context) {
    return addFileApi(context, blobService);
}

export function getFile(context) {
    return getFileApi(context, blobService);
}
