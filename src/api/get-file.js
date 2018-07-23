/* eslint-disable no-underscore-dangle */

const stream = require("stream");

const { CONTAINER_NAME } = require("../config");

export default function getFile(context, blobService) {
    try {
        const { query, params: { uuid } } = context.req;

        const { format, date, caller } = query;

        if (!format && !date && !caller) {
            context.log(`Invalid request: missing params format=${format} date=${date} caller=${caller}`);
            context.res = {
                status: 400,
                body: null
            };
            context.done();
            return;
        }

        const [year, month, day] = date.replace(/(^|-)0+/g, "$1").split("-");
        const paths = [year, month, day, caller];

        if (paths.filter(x => x).length !== 4) {
            context.log("Invalid request: wrong params format used");
            context.res = {
                status: 400,
                body: null
            };
            context.done();
            return;
        }

        const extension = format === "gzip" ? "gz" : "txt";
        const completePath = `${paths.join("/")}/${uuid}.${extension}`;

        context.log(`Check if blob ${CONTAINER_NAME}/${completePath} exist`);

        blobService.getBlobProperties(CONTAINER_NAME, completePath, error => {
            if (error) {
                context.log("Requested blob do not exist");
                context.res = {
                    status: 404,
                    body: null
                };
                context.done();
            }
        });

        context.log(`Reading ${CONTAINER_NAME}/${completePath}`);

        if (extension === "gz") {
            const outputStream = new stream.Writable();

            outputStream.contents = new Uint8Array(0);

            // Override the write to store the value to our "contents"
            outputStream._write = function write(chunk, encoding, done) {
                var curChunk = new Uint8Array(chunk);
                var tmp = new Uint8Array(this.contents.byteLength + curChunk.byteLength);
                tmp.set(this.contents, 0);
                tmp.set(curChunk, this.contents.byteLength);
                this.contents = tmp;
                done();
            };

            blobService.getBlobToStream(CONTAINER_NAME, completePath, outputStream, error => {
                if (error) {
                    throw new Error(error);
                }

                context.log("File text succesfully readed");
                context.res = {
                    isRaw: true,
                    status: 200,
                    body: outputStream.contents,
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Content-Encoding": "gzip"
                    }
                };
                context.done();
            });
        } else {
            blobService.getBlobToText(CONTAINER_NAME, completePath, (error, result) => {
                if (error) {
                    throw new Error(error);
                }

                context.log("File text succesfully readed");
                context.res = {
                    isRaw: true,
                    status: 200,
                    body: result,
                    headers: {
                        "Content-Type": "application/xml"
                    }
                };
                context.done();
            });
        }
    } catch (error) {
        context.log(error);
        context.res = {
            status: 500,
            body: null
        };
        context.done();
    }
}
