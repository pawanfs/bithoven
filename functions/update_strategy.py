import json
import boto3
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Parse the input
    try:
        body = json.loads(event['body'])
        strategy_id = body['strategy_id']
        new_strategy = body['new_strategy']
    except (KeyError, json.JSONDecodeError) as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid input: ' + str(e)})
        }

    # Update the strategy in the database (assuming DynamoDB)
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Strategies')

    try:
        response = table.update_item(
            Key={'strategy_id': strategy_id},
            UpdateExpression="set strategy=:s",
            ExpressionAttributeValues={':s': new_strategy},
            ReturnValues="UPDATED_NEW"
        )
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Could not update strategy: ' + e.response['Error']['Message']})
        }

    # Return the updated strategy
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Strategy updated successfully', 'updated_strategy': response['Attributes']})
    }