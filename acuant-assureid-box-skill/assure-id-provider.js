const _ = require('lodash');
const toArray = require('stream-to-array');
const request = require('request-promise');
const moment = require('moment');

const ASSURE_ID_ENDPOINT = process.env.ASSURE_ID_ENDPOINT;
const ASSURE_ID_USERNAME = process.env.ASSURE_ID_USERNAME;
const ASSURE_ID_PASSWORD = process.env.ASSURE_ID_PASSWORD;
const ASSURE_ID_SUBSCRIPTION_ID = process.env.ASSURE_ID_SUBSCRIPTION_ID;
const credentials = Buffer.from(`${ASSURE_ID_USERNAME}:${ASSURE_ID_PASSWORD}`).toString('base64');

class AssureIdProvider {

    /**
     * Get the AssureID metadata for an image
     *
     * @param {byte[]} fileByteArray - The byte[] object for the Box file
     * @returns {object} - Returns a JSON object with the metadata entries arrays and document instance id
     */
    async function getAssureIdMetadata(contentByteArray) {
        let assureIDMetadata = {};
        try {
            // Get AssureId subscription
            const isSubscriptionActive = await this.getSubscription();
            // If AssureId is active, continue     
            if(isSubscriptionActive) {
                // Create AssureId document instance
                const documentInstanceId = await this.createDocumentInstance();

                // If AssureId document instance is not undefined, continue
                if(documentInstanceId) {
                    assureIDMetadata.docucment_intance_id = documentInstanceId;

                    // Send the image file to AssureId
                    const postImageSuccessful = await this.sendDocumentImage(documentInstanceId, contentByteArray);

                    // If posting the image to the AssureId document instance is successful, continue
                    if(postImageSuccessful) {
                        // Get the results from the AssureId
                        const documentInstanceResults = await this.getDocumentInstanceResults(assureIDMetadata.docucment_intance_id);
                        
                        if(documentInstanceResults) {
                            // Get the issuer metadata entries array
                            assureIDMetadata.issuer = this.getIssuerEntries(documentInstanceResults);
                            
                            // Get the Fields from the AssureId document instance results
                            const dataFieldsArray = documentInstanceResults.Fields;
            
                            // Get the ID card metadata entries array
                            assureIDMetadata.id_card = this.getIDCardEntries(dataFieldsArray);
                            
                            // Get the ID holder metadata entries array
                            assureIDMetadata.id_holder = this.getIDHolderEntries(dataFieldsArray);
                            
                            
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Failed to get AssureID metadata: ', error);
        } finally {
            // Return AssureID metadata
            return assureIDMetadata;
        }    
    }

    /**
     * Get the content byte array from the content stream
     *
     * @param {object} contentStream - The stream for a box file
     * @returns {byte[]} - The byte[] object for the Box file
     */
    async function getContentByteArray(contentStream) {
        let fileByteArray;
        try {
            fileByteArray = await toArray(contentStream);
        } catch (error) {
            console.log('Failed to get file byte array: ', error);
        } finally {
            return fileByteArray;
        }
    }
    
    /**
     * Get the AssureID subscription
     *
     * @returns {boolean} - Returns a boolean representing if the AssureID subscription is active or not
     */
    async function getSubscription() {
        let isSubscriptionActive;
        try {
            // AssureID Subscription Endpoint
            const subscriptionUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Subscriptions`;
    
            // Request options
            const options = {
                uri: subscriptionUrl,
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Basic ${credentials}`
                },
                json: true
            };

            // Issue a GET request for the AssureID subscriptions
            const subscriptions = await request(options);

            // Check if the subscriptions array has values
            if(subscriptions.length > 0) {
                // Get the Id and IsActive object
                const { Id, IsActive } = subscriptions[0];
                console.log('Found subscriptions response: ', subscriptions);
                
                // If the the Id and IsActive variables are found, return true. Else return false
                if(Id === ASSURE_ID_SUBSCRIPTION_ID && IsActive){
                    console.log('Subscription id matches and is active!!!');
                    isSubscriptionActive = true;
                }
                else {
                    isSubscriptionActive = false;
                }
            }
        } catch (error) {
            console.log('Failed to get AssureId subscriptions: ', error);
        } finally {
            return isSubscriptionActive;
        }
    }
    
    /**
     * Creates a AssureID document instance
     *
     * @returns {string} - The ID string representing the newly created document instance
     */
    async function createDocumentInstance() {
        let documentInstanceId;
        try {
            // AssureID Document Instance endpoint
            const postDocInstanceUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/Instance`;

            // Request options
            const options = {
                    uri: postDocInstanceUrl,
                    method: 'POST',
                    headers: { 
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`
                    },
                    body: {
                        'SubscriptionId': ASSURE_ID_SUBSCRIPTION_ID,
                        'ImageCroppingExpectedSize': 0,
                        'ImageCroppingMode': 1,
                        'ManualDocumentType': null,
                        'ProcessMode': 0,
                        'Device': {
                            'HasContactlessChipReader': false,
                            'HasMagneticStripeReader': false,
                            'SerialNumber': 'xxx',
                            'Type': {
                                'Manufacturer': 'Box',
                                'Model': 'Box Skills',
                                'SensorType': 0
                            }
                        },
                        'AuthenticationSensitivity': 0,
                        'ClassificationMode': 0
                    },
                    json: true
                };
                
            // Issue a POST request to create an AssureID document instance 
            documentInstanceId = await request(options);
            console.log('Found document instance response: ', documentInstanceId);
        } catch (error) {
            console.log('Failed to create document instance id: ', error);
        } finally {
            return documentInstanceId;
        }
    }
    
    /**
     * Add the document image byte[] to the document intsance
     *
     * @param {string} documentInstanceId - The string ID representing the AssureID document instance
     * @param {byte[]} fileByteArray - The byte[] object for the Box file
     * @returns {boolean} - The boolean representing whether or no the image was successfully sent to the AssureID image endpoint
     */
    async function sendDocumentImage(documentInstanceId, fileByteArray) {
        let isUploadSuccessful = false;
        try {
            // The AssureID document image endpoint
            const postDocumentImageUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/${documentInstanceId}/Image`;
            
            // Request options
            const options = {
                    uri: postDocumentImageUrl,
                    method: 'POST',
                    qs: {
                        side: 0,
                        light: 0,
                        metrics: false
                    },
                    headers: {
                        'Authorization': `Basic ${credentials}`
                    },
                    body: fileByteArray
                };
                
                // Issue a POST request to send the document image byte[] to AssureID and return a boolean
                await request(options);
                isUploadSuccessful = true;
        } catch (error) {
            console.log('Failed to send document image to AssureId: ', error);
        } finally {
            return isUploadSuccessful;
        }
    }
    
    /**
     * Get the AssureID document instance results
     *
     * @param {string} documentInstanceId - The string ID representing the AssureID document instance
     * @returns {Object} documentResults - The JSON object presenting the processing results from AssureID
     */
    async function getDocumentInstanceResults(documentInstanceId) {
        let documentResults;
        try{
            // AssureID Document Instance endpoint
            const getDocumentInstanceUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/${documentInstanceId}`;
            
            // Request options
            const options = {
                uri: getDocumentInstanceUrl,
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Basic ${credentials}`
                },
                json: true
            };
            
            // Issue a GET request to get the document instance results from AssureID
            documentResults = await request(options);
            console.log('Found AssureId document instance results: ', documentResults);
        } catch (error) {
            console.log('Failed to get document instance results', error);
        } finally {
            return documentResults;
        }
    }
    
    /**
     * Delete the document instance from AssureID
     *
     * @param {string} documentInstanceId - The string ID representing the AssureID document instance
     * @returns {boolean} - The boolean value that representing whether or the AssureID document instance has been deleted
     * @memberof AssureIdManager
     */
    async function deleteDocumentInstance(documentInstanceId) {
        let isInstanceDeleted = false;
        try {
            // AssureID delete document instance endpoint
            const deleteDocumentInstanceUrl = `${ASSURE_ID_ENDPOINT}/AssureIDService/Document/${documentInstanceId}`;
            
            // Request options
            const options = {
                uri: deleteDocumentInstanceUrl,
                method: 'DELETE',
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Basic ${credentials}`
                },
                json: true
            };

            // Issue a DELETE request to delete the document instance from AssureID
            const deleteDocumentInstanceResults = await request(options);
            console.log('Successfully deleted AssureId document instance!');
            isInstanceDeleted = true;
        } catch (error) {
            console.log('Failed to delete document instance: ', error);
        } finally {
            return isInstanceDeleted;
        }
    }

    /**
     * Get the ID issuer metadata entries
     *
     * @param {object} documentInstanceResults - The JSON object containing the results from AssureID
     * @returns {object[]} - Returns an array of json objects 
     */
    getIssuerEntries(documentInstanceResults) {
        // Create Issuer entries
        const { ClassName, IssueType, IssuerCode, IssuerName, Name } = documentInstanceResults.Classification.Type;
        let issuerEntries = [];
        if(ClassName) {
            issuerEntries.push({
                type: 'text',
                text: `ID Class: ${ClassName}` 
            });
        }
        
        // Get the ID Type
        if(IssueType) {
            issuerEntries.push({
                type: 'text',
                text: `ID Type: ${IssueType}` 
            });
        }
        
        // Get the ID Name
        if(Name) {
            issuerEntries.push({
                type: 'text',
                text: `ID Name: ${Name}` 
            });
        }
        
        // Get the Issuer Name
        if(IssuerName) {
            issuerEntries.push({
                type: 'text',
                text: `Issuer Name: ${IssuerName}` 
            });
        }
        
        // Get the Issuer Code
        if(IssuerCode) {
            issuerEntries.push({
                type: 'text',
                text: `Issuer Code: ${IssuerCode}` 
            });
        }
        return issuerEntries;
    }
    
    /**
     * Get the ID card metadata entries
     *
     * @param {object} documentInstanceResults - The JSON object containing the results from AssureID
     * @returns {object[]} - Returns an array of json objects 
     */
    getIDCardEntries(dataFieldsArray) {
        // Create ID Metadata card
        let idFieldEntries = [];
        
        // Add ID Metadata elements
        const controlNumber = _.filter(dataFieldsArray, ({Name}) => Name === 'Control Number')[0];
        if(controlNumber) {
            idFieldEntries.push({
                type: 'text',
                text: `Control Number: ${controlNumber.Value}`
            });
        }
        
        // Get the document number
        const documentNumber = _.filter(dataFieldsArray, ({Name}) => Name === 'Document Number')[0];
        if(documentNumber) {
            idFieldEntries.push({
                type: 'text',
                text: `Document Number: ${documentNumber.Value}`
            });
        }
        
        // Get the issue date
        const issueDateString = _.filter(dataFieldsArray, ({Name}) => Name === 'Issue Date')[0];
        if(issueDateString) {
            const issueDateValue = issueDateString.Value;
            const issueDateUnix = issueDateValue.substring(issueDateValue.lastIndexOf('(') + 1, issueDateValue.lastIndexOf(')')).slice(0, -3);
            const issueDate = moment.unix(issueDateUnix).format('MM-DD-YYYY');
            idFieldEntries.push({
                type: 'text',
                text: `Issue Date: ${issueDate}`
            });
        }
        
        // Get the expiration date
        const expDateString = _.filter(dataFieldsArray, ({Name}) => Name === 'Expiration Date')[0];
        if(expDateString) {
            const expDateValue = expDateString.Value;
            const expDateUnix = expDateValue.substring(expDateValue.lastIndexOf('(') + 1, expDateValue.lastIndexOf(')')).slice(0, -3);
            const expDate = moment.unix(expDateUnix).format('MM-DD-YYYY');
            idFieldEntries.push({
                type: 'text',
                text: `Expiration Date: ${expDate}`
            });
        }
    
        return idFieldEntries;
    }
    
    /**
     * Get the ID holder metadata entries
     *
     * @param {object} documentInstanceResults - The JSON object containing the results from AssureID
     * @returns {object[]} - Returns an array of json objects 
     */
    getIDHolderEntries(dataFieldsArray) {
        // Create ID Holder Metadata card
        let holderFieldntries = [];
    
        // Add ID Holder Metadata
        const firstName = _.filter(dataFieldsArray, ({Name}) => Name === 'Given Name')[0];
        if(firstName) {
            holderFieldntries.push({
                type: 'text',
                text: `First Name: ${firstName.Value}`
            });
        }
        
        // Get the last name
        const lastName = _.filter(dataFieldsArray, ({Name}) => Name === 'Surname')[0];
        if(lastName) {
            holderFieldntries.push({
                type: 'text',
                text: `Last Name: ${lastName.Value}`
            });
        }
    
        // Get the birth date
        const birthDateString = _.filter(dataFieldsArray, ({Name}) => Name === 'Birth Date')[0];
        if(birthDateString) {
            const birthDateValue = birthDateString.Value;
            const birthDateUnix = birthDateValue.substring(birthDateValue.lastIndexOf('(') + 1, birthDateValue.lastIndexOf(')')).slice(0, -3);
            const birthDate = moment.unix(birthDateUnix).format('MM-DD-YYYY');
            holderFieldntries.push({
                type: 'text',
                text: `Birth Date: ${birthDate}`
            });
        }
        
        // Get the gender
        const gender = _.filter(dataFieldsArray, ({Name}) => Name === 'Sex')[0];
        if(gender) {
            holderFieldntries.push({
                type: 'text',
                text: `Gender: ${gender.Value}`
            });
        }
        
        // Get the address
        const address = _.filter(dataFieldsArray, ({Name}) => Name === 'Address')[0];
        if(address) {
            holderFieldntries.push({
                type: 'text',
                text: `Address: ${address.Value}`
            });
        }
    
        // Get the eye color
        const eyeColor = _.filter(dataFieldsArray, ({Name}) => Name === 'Eye Color')[0];
        if(eyeColor) {
            holderFieldntries.push({
                type: 'text',
                text: `Eye Color: ${eyeColor.Value}`
            });
        }
        
        // Get the height
        const height = _.filter(dataFieldsArray, ({Name}) => Name === 'Height')[0];
        if(height) {
            holderFieldntries.push({
                type: 'text',
                text: `Height: ${height.Value}`
            });
        }
    
        return holderFieldntries;
    }
}
module.exports = new AssureIdProvider();