# Acuant AssureID Box Skill
Use [Acuant AssureID](https://www.acuantcorp.com/products/assureid-identity-verification-software/) to classify and automatically extract metadata from a government-issued ID and add the metadata to content managed in Box.

![Government ID Image](/acuant-assureid-goverment-id-data-extraction/images/acuant-assure-id-skill.png)

## Usage

### Prerequisites

* [Contact Acuant](https://www.acuantcorp.com/lets-talk/) for access to the AssureID developer API's.
* Sign up for a [Box Developer](https://developer.box.com/) account and prepare your app for Box skills. See our [developer documentation](https://developer.box.com/docs/box-skills) for more guidance. 

### Configuring Serverless

Our Box skills uses the excellent [Serverless framework](https://serverless.com/). This framework allows for deployment to various serverless platforms, but in this example we will use AWS as an example.

To use Serverless, install the NPM module.

```bash
npm install -g serverless
```

Next, follow our guide on [configuring Serverless for AWS](../AWS_CONFIGURATION.md), or any of the guides on [serverless.com](https://serverless.com/) to allow deploying to your favorite serverless provider.


Clone this repo and change into the folder.

```bash
git clone https://github.com/box-community/sample-image-skills
cd sample-image-skills/acuant-assureid-goverment-id-data-extraction
```

Then change the `ASSURE_ID_USERNAME`, `ASSURE_ID_PASSWORD`, `ASSURE_ID_SUBSCRIPTION_ID` environment variables in your `serverless.yml`.

```yaml
...

functions:
  index:
    ...
    environment:
      ASSURE_ID_USERNAME: CHANGE_ME
      ASSURE_ID_PASSWORD: CHANGE_ME
      ASSURE_ID_SUBSCRIPTION_ID: CHANGE_ME
```

Finally, deploy the Skill.

```bash
serverless deploy -v
```

At the end of this, you will have an invocation URL for your Lambda function. 

### Set the invocation URL

The final step is to [configure your Box Skill with the invocation URL](https://developer.box.com/docs/configure-a-box-skill) for your Lambda function. You should have received this in the previous, after you deployed the function for the first time.

Once your new skill is called by our code, the Skill usually takes around a few minutes to process and write the new metadata to the file.

## Frequently Asked Questions

### Who might use this Skill?
If you have ever manually identify the type of government ID and enter any data from a government ID, then this Skill might be for you. And particularly if your government ID's are part of a verification or customer on-boarding workflow. Much of this manual data entry can now be automated.

### What types of files does this Skill handle?
This skill can images with the following extensions:
* bmp
* png
* tiff, tif
* jpeg, jpg

### Is there a required amount of dots per square inch (DPI)?
DPI of 96 and above is required. For best results, a DPI of 300 is recommended.

### What metadata is written back to my Box file?
The skills populates metadata around the ID issuer (Example: Issuer = New York State), the ID itself (Example: Expiration Date = 01/01/2019), and the ID holder (Example: Name = John Doe).

### What implications does this have for my business?
Using Box with Acuant AssureID has the potential to eliminate enormous ammounts of manual data entry using automated data capture that matches human levels of accuracy.

Additionally, the Box API can then kick off use case-specific workflows based on the returned metadata, like validating fraudulent applicants, flagging expired IDs, or adding retention policies based on dates.
