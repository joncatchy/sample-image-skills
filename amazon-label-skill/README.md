## Amazon Label Skill

### Functionality of this skill:
This skill will take an image uploaded to Box and use Amazon Rekognition to assign labels to the image.

### Using this skill:
Install the required packages by running `npm install` in the root directory of this project

Either use the npm tool `serverless` to deploy the zip file to your AWS lambda function as specified in the Skillskit 2.0 instructions, or zip and upload the root folder of this project to your AWS lambda function

In your AWS account, ensure that you have permissioned the identity that will be using the skill to have access to the Rekognition services in the Identity Access Management (IAM) portal within AWS. The policy should look similar to this:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:*"
            ],
            "Resource": "*"
        }
    ]
}
```
Login to your Box account developer console and create a new skill in your enterprise. Copy and paste the lambda invocation URL either from the output of the serverless function or from AWS lambda itself, and assign a folder ID to have the skill listen for image uploads on

Upload and image to the folder you specified in the setup, then after a few seconds open the image up within Box to see the labels that have been added to the metadata cards on the side of the image.

You can change the maximum amount of labels that will appear on the image as well as the minimum confidence level Rekognition needs to assign a label in the `index.js` file at the top. The constant `MAX_LABELS` is the maximum amount of labels that Rekognition will associate with the image and the constant `MIN_CONFIDENCE` is the percentage that Rekognition needs to have in order to assign a label. The default confidence level is 70 in this application.
