# Google Cloud Vision Product Search Box Skill

Use the [Google Cloud Vision Product Search API](https://cloud.google.com/vision/product-search/docs/) to compare images in Box with the images in a pretrained product catalog. The resultsare written to Box as metadata attached to the original image.

![Alt text](sample.png?raw=true "Box Skills view, similar products")

## Usage

### Prerequisites

* Follow [these instructions](https://cloud.google.com/vision/product-search/docs/quickstart) to setup a product search catalog on Google Cloud.
* Ensure you have a project on Google Cloud and billing enabled.
* Sign up for a [Box Developer](https://developer.box.com/) account and prepare your app for Box skills. See our [developer documentation](https://developer.box.com/docs/box-skills) for more guidance. 

### Configuring Serverless

Our Box skills uses the excellent [Serverless framework](https://serverless.com/). This framework allows for deployment to various serverless platforms, but in this example we will use AWS as an example.

To use Serverless, install the NPM module.

```bash
npm install -g serverless
```

Next, follow [this guide](https://serverless.com/framework/docs/providers/google/guide/credentials/) to set up deploying to Google Cloud.

Clone this repo and change into the folder.

```bash
git clone https://github.com/box-community/sample-image-skills
cd sample-image-skills/google-product-search-integration
```

Download your credentials from Google Cloud and save them to a file called `privatekey.json`.

Then change the project name, and the `PROJECT_ID`, `LOCATION`, and `SET_ID` environment variables in your `serverless.yml`.

```yaml
...
provider:
  name: google
  runtime: nodejs8
  project: PROJECT
  # the path to the credentials file needs to be absolute
  credentials: ./privatekey.json
  environment:
     PROJECT_ID: PROJECT_ID
     LOCATION: LOCATION
     SET_ID: SET_ID
```

Finally, fetch all dependencies and deploy the Skill.

```bash
npm install
serverless deploy -v
```

At the end of this, you will have an invocation URL for your Lambda function.

### Set the invocation URL

The final step is to [configure your Box Skill with the invocation URL](https://developer.box.com/docs/configure-a-box-skill) for your Lambda function. You should have received this in the previous, after you deployed the function for the first time.

Once your new skill is called by our code, the Skill usually takes around a few minutes to process and write the new metadata to the file.

## Frequently Asked Questions

### What is Google Cloud Vision Product Search?

Cloud Vision Product Search allows retailers to create a set of products, each containing reference images that visually describe the product from a set of viewpoints. Currently Vision API Product Search supports the following product categories: homegoods, apparel, and toys.

When users query the product set with their own images, Vision Product Search applies machine learning to compare the product in the user's image with the images in your product set, and then returns a ranked list of visually and semantically similar results.

### How do I use this skill on Box.com?

* Upload an image file that represents a product. 
* The upload triggers the Box Skill to make a call to the Google cloud function previously deployed and configured in Box Admin Console.
* The Cloud Function then:
  * Uses the Box's Skills kit FileReader to read the base64 encoded image string
  * Calls the Google product search API
  * Creates a Topics Card with data returned from the product search API
  * Creates a Faces card to create an icon based on the image
  * Stores these Box Skill cards as metadata with Box using SkillsWriter provided by the Box Skills kit.   

You can then open the image in Box and click select the "Skills" panel - a wand like icon on the right. You will be able to see the metadata now present in that panel.

### Who might use this Skill?

If you, a retailer, use Box for storing all your product  related data such as images. There are a lot of images to organize and you need a quick way to not only organize these datasets but also find out similar products, the max price of such products and other information.
You choose to create a ML powered product catalog in Google Cloud, which allows you to query visually and semantically similar items. Once you upload the data into Box, the custom skill that you've built will call the Google Cloud Product Search api - the catalog for which you;ve built already - The API returns similar product in your catalog and the category, price information.

### What types of files does this Skill handle?

This skill can handle images with `.bmp`, `.png`, `.tiff`, `.tif`, `.jpg`, and `.jpeg` extensions.

### What metadata is written back to my Box file?

This skill populates metadata around the similar product's in your catalog, the max price of such products.

### What implications does this have for my business?

This particular example explores integrating Box with one of AI/ML service that Google offers. Depending on your business needs you can tap into various [AI/ML services](https://cloud.google.com/products/ai/) from Google and automate/enhance your existing capabilities and integrate your file stores with your Business processes.
