const rp = require('request-promise-native');
const { FilesReader, SkillsWriter, SkillsErrorEnum } = require('./skills-kit-2.0');

// A confidence threshold can be used to omit results that are lower
// than a certain confidence score
const CONFIDENCE_THRESHOLD = 0.8;

exports.handler = async (ctx, cb) => {
  // Instantiate our Skills Kit helper classes
  const filesReader = new FilesReader(ctx.body_raw);
  const skillsWriter = new SkillsWriter(filesReader.getFileContext());

  // Update our Box metadata to show that our skill is processing
  await skillsWriter.saveProcessingCard();

  try {
    // Make a POST request to Hive to process our file
    const BOX_FILE_URL = filesReader.getFileContext().fileDownloadURL;
    const options = {
      method: 'POST',
      url: process.env.HIVE_API_ENDPOINT,
      headers: { authorization: `Token ${process.env.HIVE_API_KEY}` },
      formData: {
        image_url: BOX_FILE_URL
      }
    };
    const hiveResponse = await rp(options);

    // Transform Hive's response into a properly-formatted data list
    const facesDataList = processHiveResponse(hiveResponse);

    // Save the Topics metadata card to Box
    const cards = [];
    cards.push(skillsWriter.createTopicsCard(facesDataList, null, 'faces'));
    await skillsWriter.saveDataCards(cards);
  } catch (error) {
    // On errors, we can save an Error metadata card to Box
    console.error(
      `Skill processing failed for file: ${filesReader.getFileContext().fileId} with error: ${
        error.message
      }`
    );
    await skillsWriter.saveErrorCard(SkillsErrorEnum.UNKNOWN);
  } finally {
    // The Skills Engine requires a 200 response within 10 seconds of sending an event.
    cb(null, { statusCode: 200 });
  }
};

/***
 * For simplicity, this function processes Hive' response and returns a properly formatted
 * data list to use for a Topics skills metadata card.
 */
function processHiveResponse(res) {
  const hiveObj = JSON.parse(res);
  // here we're using object destructuring to pull some key info from the response.
  // hiveResponseId and hiveResponseStatus could be used for additional logging/error handling.
  // we'll focus on response.output, which contains the results from Hive.
  const { id: hiveResonseId } = hiveObj;
  const [{ status: hiveResponseStatus, response }] = hiveObj.status;
  const hiveOutput = response.output;
  const [{ bounding_poly }] = hiveOutput; // bounding_poly contains an array of face objects
  const results = [];
  bounding_poly.forEach(({ classes }) => {
    // we're taking only the first face Hive recognized (generally there will only be one),
    // ensuring its score meets our confidence threshold.
    if (classes > 0 && classes[0].class && classes[0].score >= CONFIDENCE_THRESHOLD) {
      // the Topics card expects an array of objects in the format [{text: 'item'}]
      results.push({ text: classes[0].class });
    }
  });
  return results;
}
