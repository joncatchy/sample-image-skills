Government ID extraction Box Skill example powered by Acuant AssureID
=====================================================================
![Government ID Image](/images/acuant-assure-id-skill.png)

Creating and Deploying the Box Skill Example
--------------------------------------------
1) Review the following [documentation](https://developer.box.com/docs/creating-your-a-box-skill-using-serverless).
2) Clone this repo
3) Install project dependencies
```
yarn install
```
OR
```
npm install
```
4) Install Serverless
```
yarn global add serverless
```
OR
```
npm intall -g serverless
```
5) Configure Serverless with your AWS IAM credentials
```
serverless config credentials --provider aws --key YOURAPIKEY --secret YOURSECRET
```
6) Update the folowing environment variables in the [serverless.yml](/serverless.yml) file
  * ASSURE_ID_USERNAME
  * ASSURE_ID_PASSWORD
  * ASSURE_ID_SUBSCRIPTION_ID
7) Deploy the lambda using serverless
```
serverless deploy -v
```
8) Test your AWS Lambda function
```
serverless invoke local --function index --data '{"key1":"value1"}'
```
9) Register your custom skill using the following [documentation](https://developer.box.com/docs/creating-your-a-box-skill-using-serverless#section-5-register-your-skill-application-with-box).
