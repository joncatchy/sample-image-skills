# Google Cloud Vision Product Search Box Skill
We will use [Google Cloud Vision Product Search API](https://cloud.google.com/vision/product-search/docs/) to:
* Create an indexed catalog of products in Google Cloud using Cloud vision product search API
*  Apply machine learning to compare the product in the user's image (uploaded into Box) with the images in the product catalog, and return a ranked list of visually and semantically similar results.
* These are stored as metadata within Box, by using Box custom skills.

![Alt text](sample.png?raw=true "Box Skills view, similar products")

## Usage

### Prerequisites

* Please follow instructions at https://cloud.google.com/vision/product-search/docs/quickstart to setup product search catalog on Google Cloud. Ensure you have a project in GCP and billing enabled !. 
* Follow instructions at https://serverless.com/framework/docs/providers/google/guide/installation/ to install serverless
* Follow instructions at https://serverless.com/framework/docs/providers/google/guide/credentials/ to create Google Cloud Service account and to give appropriate privileges to the service account.
* Download the private-key json file from Google Cloud and save it at secure location on your workstation.
* Clone the repo
```
      git clone https://github.com/ashokhollav/sample-google-product-search-integration
```
* Edit the serverless.yml 
  * update the project_id
  * update the location of your private key, downloaded earlier
* Edit the index.js file
  * update the code to reflect your project specific details in the parameters being passed for     productSearchClient.productSetPath(..)
* Install the dependencies
```
      npm install --save

```
* Deploy the function to Google Cloud
```
      serverless deploy
```
      
You can also follow instructions @ https://cloud.google.com/functions/getting-started/ to use google native tools.

* Follow instructions at https://developer.box.com/docs/build-a-box-skill and at https://developer.box.com/docs/configure-a-box-skill to build a Box skill app using Box's developer console and enable it using Admin Console.
* Ensure when you configure the app , you have the Google Cloud function endpoint URL at hand

### Things to note:
* If downloading the skills-kit library from https://github.com/box/box-skills-kit-nodejs/tree/master/skills-kit-library then replace the skills-kits-2.0.js in the library directory and make the following changes
  * You receive a JSON object instead of JSON string from Box to your Google cloud function, hence you will have to edit the line 131 in the skills-kit library 
      
 ```javascript
 from 
        function FilesReader(body) {
          const eventBody = JSON.parse(body);
          ....
      }
    
 to 
 
      function FilesReader(body) {
        const eventBody =body;
        ....
      }
  ```
## Frequently Asked Questions
### What is the AI service that is integrated in this demo ?
<b>Google Cloud Vision Product Search</b>

Cloud Vision Product Search allows retailers to create a set of products, each containing reference images that visually describe the product from a set of viewpoints. Currently Vision API Product Search supports the following product categories: homegoods, apparel, and toys.

When users query the product set with their own images, Vision Product Search applies machine learning to compare the product in the user's image with the images in your product set, and then returns a ranked list of visually and semantically similar results.

### What is the workflow of this demo and how does it work ?

* Upload an image file that represents a product, in this demo we use the one of the images from gs://cloud-ai-vision-data/product-search-tutorial/images/ or a similar image sourced from the internet into your Box drive
* The upload triggers a Box skill event workflow, this calls the Google cloud function previously deployed and configured in Box Admin Console.
* The Cloud Function does the following
  * Use the Box skills kit's FileReader api to read the base64 encoded image string
  * Call the product search api that we previously configured
  * Create a Topics Card with data returned from the product search API
  * Create a Faces card to create an icon based on the image
  * Persist the skills card with Box using skillswriter api.
      
* You open the image in Box drive and click on the "skills" menu (a wand like icon on the right)
* Product catalog information, with similar products and max price is populated - powered by Cloud Vision Product Search API from Google

### Who might use this Skill?
If you, a retailer, use Box for storing all your product  related data such as images. There are a lot of images to organize and you need a quick way to not only organize these datasets but also find out similar products, the max price of such products and other information.
You choose to create a ML powered product catalog in Google Cloud, which allows you to query visually and semantically similar items. Once you upload the data into Box, the custom skill that you've built will call the Google Cloud Product Search api - the catalog for which you;ve built already - The API returns similar product in your catalog and the category, price information.

### What types of files does this Skill handle?
This skill can handle images with the following extensions:
* bmp
* png
* tiff, tif
* jpeg, jpg

### What metadata is written back to my Box file?
The skills populates metadata around the similar product's in your catalog, the max price of such products.

### What implications does this have for my business?
This particular example explores integrating Box with one of AI/ML service that Google offers. Depending on your business needs you can tap into various [AI/ML services](https://cloud.google.com/products/ai/) from Google and automate/enhance your existing capabilities and integrate your file stores with your Business processes.

## License
This project is licensed under the [Apache 2.0 License](LICENSE.txt)
