const { FilesReader, SkillsWriter, SkillsErrorEnum } = require('./skills-kit-2.0');
const AssureIdProvider = require('./assure-id-provider');

exports.handler = async (event) => {   
    console.debug(`Box event received: ${JSON.stringify(event)}`);
 
    // Get Box Skills variables
    const filesReader = new FilesReader(event.body);
    const skillsWriter = new SkillsWriter(filesReader.getFileContext());

    // Save Processing Card
    await skillsWriter.saveProcessingCard();

    try {
        // Get Content Stream
        const contentStream = await filesReader.getContentStream();

        // Get Content Byte Array
        const contentByteArray = await AssureIdProvider.getContentByteArray(contentStream);

        // Get AssureID Metadata
        const assureIdMetadata = await AssureIdProvider.getAssureIdMetadata(contentByteArray);

        // Create the Box Skills Cards metadata
        const cards = [];
        cards.push(skillsWriter.createTranscriptsCard(assureIdMetadata.issuer, null, 'ID Issuer Metadata'));
        cards.push(skillsWriter.createTranscriptsCard(assureIdMetadata.id_card, null, 'ID Metadata'));
        cards.push(skillsWriter.createTranscriptsCard(assureIdMetadata.id_holder, null, 'ID Holder Metadata'));
        
        // Save the new skills metadata cards
        console.log(`Created skills cards: ${cards}`);
        await skillsWriter.saveDataCards(cards);

    } catch (error) {
        console.error(`Skill processing failed for file: ${filesReader.getFileContext().fileId} with error: ${error.message}`);
        await skillsWriter.saveErrorCard(SkillsErrorEnum.UNKNOWN);

        // Delete the document instance from AssureId
        await AssureIdProvider.deleteDocumentInstance(assureIdMetadata.docucment_intance_id);
    } finally {
        // Delete the document instance from AssureId
        await AssureIdProvider.deleteDocumentInstance(assureIdMetadata.docucment_intance_id);

        return { 
            statusCode: 200,
            body: JSON.stringify({
                message: 'AssureID Skill Processing Finished!'
            })
        };
    }
};
