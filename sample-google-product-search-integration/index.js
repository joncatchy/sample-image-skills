// Import FilesReader and SkillsWriter classes from skills-kit-2.0.js library
const { FilesReader, SkillsWriter, SkillsErrorEnum } = require('./library/skills-kit-2.0');
var Set = require("collections/set");
const vision = require('@google-cloud/vision');

function max(price) {

}

exports.skills = async (event, context, callback) => {
    // During code development you can copy an incoming box skills event
    // and paste it within integration-test-request.json file. This static request
    // would be invoked after every cloud deployment and can save you the time it takes
    // to repeatedely upload a file to box and trigger skill for testing.
    // Note: the static request event expires after some hours.
    const data = event;
    console.log("printing ")
    console.log(data.body);

    // instantiate your two skill development helper tools
    const filesReader = new FilesReader(data.body);
    const skillsWriter = new SkillsWriter(filesReader.getFileContext());
    const productSearchClient = new vision.ProductSearchClient();
    const imageAnnotatorClient = new vision.ImageAnnotatorClient();

    // update your project specific details here
    
    const productSetPath = productSearchClient.productSetPath(
        '<your-project-id>',
        '<us-east1>',
        '<product_set1>'
        );

    await skillsWriter.saveProcessingCard();

    try {
        // One of six ways of accessing file content from Box for ML processing with FilesReader
        // ML processing code not shown here, and will need to be added by the skill developer.
        const base64File = await filesReader.getContentBase64(); // eslint-disable-line no-unused-vars
        //console.log(`printing simplified format file content in base64 encoding: ${base64File}`);

        /*
        call vision product search to catalog/categorize this product image
        */
        const request = {
            // The input image can be a GCS link or HTTPS link or Raw image bytes.
            // Example:
            // To use GCS link replace with below code
            // image: {source: {gcsImageUri: filePath}}
            // To use HTTP link replace with below code
            // image: {source: {imageUri: filePath}}
            image: {
                content: base64File
                },
            features: [{type: 'PRODUCT_SEARCH'}],
            imageContext: {
              productSearchParams: {
                productSet: productSetPath,
                productCategories: ['apparel']
                
              },
            },
          };

          console.log(request.image);

          const [response] = await imageAnnotatorClient.batchAnnotateImages({
            requests: [request],
          });

          
          console.log('\nSimilar product information:');


          const results = response['responses'][0]['productSearchResults']['results'];

          //console.log(results);
          
          listOfDiscoveredKeywords = new Array();


          price=0.0;
          results.forEach(result => {

            if( parseFloat(result['score']) < 0.6 ) {
                return;
            }
            /*
            console.log(result['score']);
            console.log(result['image']);

            const referenceImageId = result['image'];
            const formattedName = client.referenceImagePath(
                                  '<PROJECT-ID>',
                                    'us-east1',
                                    'product_set1',
                                  referenceImageId
                                );
            const refImageRequest = {
            name: formattedName,
            };
            
            const refImageResponse = await client.getReferenceImage(refImageRequest);
            const image = refImageResponse.uri;
            var fs = require('fs');
            var imageFile = fs.readFileSync(image);
            var encoded = Buffer.from(imageFile).toString('base64');
            */


            product_name=result['product'].name.split('/').pop(-1);
            productCategory = result['product'].productCategory;

            //listOfDiscoveredKeywords.push({ text: product_name });
            const labels = result['product']['productLabels']
            
            labels.forEach(label => {
                listOfDiscoveredKeywords.push({ text: product_name + ' :: ' + label.key +' :: '+ label.value });
                if(label.key === 'price') {
                    console.log('price ' + label.value);
                    if(price <= parseFloat(label.value)) {
                            price = parseFloat(label.value);
                    }

                }
            });


            console.log('Product display name:', product_name);
            console.log('Product category:', productCategory);
          });

        listOfDiscoveredKeywords.push({ text: 'max_price' +'::'+ price });

        listOfDiscoveredKeywordsArr = Array.from(new Set(listOfDiscoveredKeywords.map(JSON.stringify))).map(JSON.parse);
        /* end GCP vision API call*/
        const url = filesReader.getFileContext().fileDownloadURL;
        const file_name = filesReader.getFileContext().fileName;

        const imageIcon = [
            {
                image_url: url ,
                text: file_name
            }
        ];

        // Turn your data into correctly formatted card jsons usking SkillsWriter.
        // The cards will appear in UI in same order as they are passed in a list.
        const cards = [];
        cards.push(await skillsWriter.createFacesCard(imageIcon, null, 'Icons')); // changing card title to non-default 'Icons'.
        cards.push(skillsWriter.createTopicsCard(listOfDiscoveredKeywordsArr,null,'Similar Products in your Catalog'));
        
        // Save the cards to Box in a single calls to show in UI.
        // Incase the skill is invoked on a new version upload of the same file,
        // this call will override any existing skills cards, data or error, on Box file preview.
        console.log(`cards ${JSON.stringify(cards)}`);
        await skillsWriter.saveDataCards(cards);
    } catch (error) {
        // Incase of error, write back an error card to UI.
        // Note: Skill developers may want to inspect the 'error' variable
        // and write back more specific errorCodes (@print SkillsWriter.error.keys())
        console.error(
            `Skill processing failed for file: ${filesReader.getFileContext().fileId} with error: ${error.message}`
        );
        await skillsWriter.saveErrorCard(SkillsErrorEnum.UNKNOWN);
    } finally {
        // Skills engine requires a 200 response within 10 seconds of sending an event.
        // Please see different code architecture configurations in git docs,
        // that you can apply to make sure your service always responds within time.
        callback(null, { statusCode: 200, body: 'Box event was processed by skill' });
    }
};
