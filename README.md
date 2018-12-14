# Box Skills Samples: Custom Skills for Processing Images 

These are community created Box Skills samples for processing **image files** on Box. By clicking on each sub-folder, you can see a demo image of the end product, as it would look in your Box file preview.

* [Acuant AssureID Government ID Data Extraction](acuant-assureid-goverment-id-data-extraction) - Uses Acuant AssureID to classify and automatically extract metadata from a government-issued ID and add the metadata to content managed in Box.

* [Amazon Rekognition Labels Detection](amazon-reckognition-labels-detection) - Uses the Amazon Rekognition API to automatically extract labels from images and add them to your image files as metadata.

* [Hive Predict face recognition](hive-predict-face-recognition) - Uses the [Hive Predict](https://thehive.ai/predict) API to automatically recognize faces in images and assign these faces as metadata to the images in Box.

Note: Box supports [the following image formats](https://community.box.com/t5/How-to-Guides-for-Managing/File-Types-and-Fonts-Supported-in-Box-Content-Preview/ta-p/327) for direct preview in Box. However some of the sample skills may only work with a smaller set of image formats given limitations from the MLP side. You can always expand the file formats supported by your skills by using the BasicFormat functionality in Skills-kit library.


## What are Box Skills?

Aa Box Skill is a type of application that performs custom processing for files uploaded to Box.

Visit the [Official Box Skills Developer Documentation](https://developer.box.com/docs/box-skills) for complete information on Box Skills, the kind of Preview Cards you can create for showing metadata, as well as a visual instructions on configuring your code for deployment.

## What is the Box Skills Kit?

The [Github Repository for Box Skills Kit Library](https://github.com/box/box-skills-kit-nodejs) is our official toolkit for writing Box Custom Skills in Node.js. It contains the [Skills-kit Library and API Documentation](https://github.com/box/box-skills-kit-nodejs/tree/master/skills-kit-library)  and Boilerplate Skills that you can quickly deploy and expand on, when building a new skill.

## How do I deploy a Box Skill?

Hava a look at our [Quick Start Deployment Instructions](https://github.com/box/box-skills-kit-nodejs/tree/master/boilerplate-skills) to learn how to deploy the boilerplate skills. Each of the sample skills in this repo may also probvide additional or alternative deployment instructions, that you could use.


## License

This project is licensed under the [Apache 2.0 License](LICENSE)

