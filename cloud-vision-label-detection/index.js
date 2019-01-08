'use strict';
const { FilesReader, SkillsWriter } = require('./skills-kit-2.0');
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();

exports.http = (request, response) => {

  // instantiate your two skill development helper tools
  const filesReader = new FilesReader(request.body);
  const skillsWriter = new SkillsWriter(filesReader.getFileContext());

  const options = {
    image: {
      source: {
        imageUri: filesReader.getFileContext().fileDownloadURL
      }
    },
    features: [
      {
        type: 'LABEL_DETECTION',
      },
      {
        type: 'WEB_DETECTION',
      },
    ]
  };
  client.annotateImage(options)
    .then((results) => {
      const labels = results[0].labelAnnotations;
      const webEntities = results[0].webDetection.webEntities;

      const combined = labels.concat(webEntities);
      const formattedTags = combined
        // we want tags of high confidence
        .filter(a => a.score > 0.85)
        .map(a => ({ text: a.description }));

      const cards = [];
      cards.push(skillsWriter.createTopicsCard(formattedTags));

      return skillsWriter.saveDataCards(cards);
    })
    .then(() => {
      return response.status(200).json({});
    })
    .catch((err) => {
      console.log(err);
      response.status(200).send(err)
    });
};

