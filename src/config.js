export const CONTAINER_BASE = process.env.CONTAINER_NAME || "storage-container-name";
export const BRANCH_NAME = process.env.BRANCH_NAME || "branch";
export const CONTAINER_NAME = `${CONTAINER_BASE}-${BRANCH_NAME}`;
