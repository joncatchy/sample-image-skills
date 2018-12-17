# EXIF/XMP MetaInfo Extraction

This is a Box skill that uses the [ExifTool library](http://owl.phy.queensu.ca/~phil/exiftool/) to extract MetaInfo from files and write it back to Box as metadata on the file. it supports a large number of different file formats for extracting EXIF/XMP data and other information and works for most image, audio, and video files.

![screenshot](exifimagedemo.png)

## What metadata is extracted?

This Skill:

* Reads EXIF, GPS, IPTC, XMP, JFIF, MakerNotes, GeoTIFF, ICC Profile, Photoshop IRB, FlashPix, AFCP, ID3 and more...
* Reads maker notes of many digital cameras
* Reads timed metadata (eg. GPS track) from MOV/MP4/M2TS/AVI videos
* Multi-lingual output (cs, de, en, en-ca, en-gb, es, fi, fr, it, ja, ko, nl, pl, ru, sv, tr, zh-cn or zh-tw)
* Geotags images from GPS track log files (with time drift correction)
* Reads structured XMP information recommendations
* Recognizes thousands of different tags
* Tested with images from thousands of different camera models
* Advanced verbose and HTML-based hex dump outputs

## Usage

### Prerequisites

* Make sure to sign up for a [Box Developer](https://developer.box.com/) account and prepare your app for Box skills. See our [developer documentation](https://developer.box.com/docs/box-skills) for more guidance. 


### Configuring Serverless

Our Box skills uses the excellent [Serverless framework](https://serverless.com/). This framework allows for deployment to various serverless platforms, but in this example we will use AWS as an example.

To use Serverless, install the NPM module.

```bash
npm install -g serverless
```

Next, follow our guide on [configuring Serverless for AWS](../AWS_CONFIGURATION.md), or any of the guides on [serverless.com](https://serverless.com/) to allow deploying to your favorite serverless provider.

### Deploying

Clone this repo and change into the sample folder.

```bash
git clone https://github.com/box-community/sample-image-skills
cd sample-image-skills/exiftool-metainfo-extraction
```

Then simply deploy the Skill using Serverless.

```bash
serverless deploy -v
```

At the end of this, you will have an invocation URL for your Lambda function. 

### Set the invocation URL

The final step is to [configure your Box Skill with the invocation URL](https://developer.box.com/docs/configure-a-box-skill) for your Lambda function. You should have received this in the previous, after you deployed the function for the first time.

Once your new skill is called by our code, the Skill usually takes around a few minutes to process and write the new metadata to the file.
