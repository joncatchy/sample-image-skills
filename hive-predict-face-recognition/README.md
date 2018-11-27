# Face Recognition on Images with Hive Predict

This is a simple, generic example of a custom face recognition skill for images using the [Box Skills Kit](https://github.com/box/box-skills-kit-nodejs)
and [Hive Predict](https://thehive.ai/docs#hive-predict-api).

### Getting started with Hive

Hive offers image classification as a service, and can provide a custom model that is trained to classify faces for your specific use case. To get started,

1) [Sign up](https://thehive.ai/signup) for a free account.
2) [Contact Hive](https://thehive.ai/contact-us) to set up a trial access to a pretrained model API endpoint.

For more info on Hive's API, please refer to their [docs](https://thehive.ai/docs#hive-predict-api). 

### Deploying

There are many available options for deploying and hosting your skills function (AWS Lambda, Google Cloud Functions, OpenWhisk, etc.).
The following demonstrates how to quickly deploy to [Webtask](https://webtask.io/). For detailed installation and deployment instructions, check out the Webtask [docs](https://webtask.io/docs/101).

1) [Create an account](https://webtask.io/login) by linking to your Github, Facebook, or Google account.

2) Install the Webtask CLI:  

    ``` npm install wt-cli -g```
3) Authenticate to Webtask:

    ```wt init```

4) Clone the sample repo:

    ``` git clone GIT_REPO_URL hive-predict-sample && cd hive-predict-sample```

5) Create a new Webtask:

    ```create index.js --name hive-predict-sample --bundle```

    The output of which will be a URL through which the webtask is available. This is the URL you will provide to Box when configuring your skill. 




![example](/screenshot.jpg)
