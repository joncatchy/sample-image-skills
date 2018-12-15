// Import FilesReader and SkillsWriter classes from skills-kit-2.0.js library
const { FilesReader, SkillsWriter, SkillsErrorEnum } = require('./skills-kit-2.0');
const exiftool = require('./exiftool.js'); // using a modified form of exiftool.js lib

const readStreamToString = async stream => {
    if (!stream || typeof stream !== 'object') {
        throw new TypeError('Invalid Stream, must be a readable stream.');
    }
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => {
            chunks.push(chunk);
        });
        stream.on('error', err => {
            reject(err);
        });
        stream.on('end', () => {
            resolve(Buffer.concat(chunks).toString('binary'));
        });
    });
};

const getContentBinary = async filesReader => {
    const stream = await filesReader.getContentStream();
    return await readStreamToString(stream);
};

module.exports.handler = async (event, context, callback) => {
    console.debug(`Box event received: ${JSON.stringify(event)}`);

    // Instantiate your two skill development helper tools
    const filesReader = new FilesReader(event.body);
    const skillsWriter = new SkillsWriter(filesReader.getFileContext());

    await skillsWriter.saveProcessingCard();

    try {
        const data = await getContentBinary(filesReader); // eslint-disable-line no-unused-vars
        const res = await exiftool.getExifFromBinaryData(data); // only extra function added by Box to exiftool.js lib
        const entries = [];
        Object.keys(res).forEach(field => {
            entries.push({
                type: 'text',
                text: `${field} : ${res[field]}`
            });
        });

        // Convert the entries into a Keyword Card
        const card = skillsWriter.createTopicsCard(entries, null, 'File MetaInfo');

        // Write the card as metadata to the file
        await skillsWriter.saveDataCards([card]);
    } catch (error) {
        console.error(
            `Skill processing failed for file: ${filesReader.getFileContext().fileId} with error: ${error.message}`
        );
        await skillsWriter.saveErrorCard(SkillsErrorEnum.FILE_PROCESSING_ERROR);
    } finally {
        // Skills engine requires a 200 response within 10 seconds of sending an event.
        // Please see different code architecture configurations in git docs,
        // that you can apply to make sure your service always responds within time.
        callback(null, { statusCode: 200, body: 'Box event was processed by skill' });
    }
};
