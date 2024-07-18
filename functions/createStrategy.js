const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const requestBody = JSON.parse(event.body);
    const { strategyName, parameters } = requestBody;

    if (!strategyName || !parameters) {
        console.error('Validation Failed');
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Strategy name and parameters are required' }),
        };
    }

    const strategyId = uuidv4();
    const timestamp = new Date().toISOString();

    const params = {
        TableName: process.env.STRATEGIES_TABLE,
        Item: {
            strategyId,
            strategyName,
            parameters,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    try {
        await dynamoDb.put(params).promise();
        console.log('Strategy created successfully:', strategyId);

        return {
            statusCode: 201,
            body: JSON.stringify({ strategyId, strategyName, parameters, createdAt: timestamp, updatedAt: timestamp }),
        };
    } catch (error) {
        console.error('Error creating strategy:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Could not create strategy' }),
        };
    }
};