import uuidv4 from "uuid/v4";
import { success } from "../messages";

const upload = (context, blobService, containerName) => {
    try {
        const { headers, body } = context.req;
        const uuid = uuidv4();
        context.log({
            request: context.req,
            uuid,
            headers,
            body
        });

        const nonEmptyHeaders = ["x-customers", "x-products", "x-license"];
        const headersValues = nonEmptyHeaders.map(x => headers[x]).filter(x => x);

        if (headersValues.length < 1) {
            context.log("Invalid request: empty headers");
            context.res = {
                status: 400,
                body: null
            };
            context.done();
            return;
        }


        if (
            !(
                headers["content-type"] === "application/json" ||
                (headers["content-type"] === "application/octet-stream" && headers["content-encoding"] === "gzip")
            )
        ) {
            context.log("Invalid content type");
            context.res = {
                status: 415,
                body: null
            };
            context.done();
            return;
        }

        if (!body) {
            context.log("Invalid request: empty body");
            context.res = {
                status: 405,
                body: null
            };
            context.done();
            return;
        }

        context.log(`Creating/fetching container named: ${containerName}`);
        blobService.createContainerIfNotExists(containerName, errorContainer => {
            if (errorContainer) {
                throw new Error(errorContainer);
            }

            context.log("Container succesfully created");

            const [caller] = headersValues;
            const date = new Date();
            const paths = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), caller].join("/");
            const extension = headers["content-encoding"] === "gzip" ? "gz" : "txt";
            const completePath = `${paths}/${uuid}.${extension}`;

            context.log("Computing metadata");
            const headersDashed = Object.keys(headers);
            const headersMetadata = headersDashed.reduce((state, current) => {
                const key = current.replace(/-/g, "_").toLowerCase();
                state[key] = headers[current].toLowerCase();
                return state;
            }, {});

            headersMetadata.loguuid = uuid;

            const options = { metadata: headersMetadata };

            context.log(`Computed metadata ${JSON.stringify(options)}`);

            context.log(`Uploading file in: ${containerName}/${completePath}`);
            blobService.createBlockBlobFromText(containerName, completePath, body, options, errorBlob => {
                if (errorBlob) {
                    throw new Error(errorBlob);
                }

                context.log("Request body succesfully uploaded");
                context.res = {
                    isRaw: true,
                    status: 200,
                    body: success(uuid),
                    headers: {
                        "Content-Type": "application/xml"
                    }
                };
                context.done();
            });
        });
    } catch (error) {
        context.log(error);
        context.res = {
            status: 500,
            body: null
        };
        context.done();
    }
};

export default upload;
