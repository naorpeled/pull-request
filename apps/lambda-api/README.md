# Lambda API - Good First Issues

This AWS Lambda function fetches and filters good first issues from the [goodfirstissues repository](https://github.com/iedr/goodfirstissues).

## Features

- ✨ Fetches data from goodfirstissues/backend/data.json
- 🔍 Filters by programming languages
- ⭐ Filters by minimum repository stars
- 💬 Filters by maximum number of comments
- 👤 Option to show only unassigned issues
- 🏷️ Filters by issue labels
- 📄 Pagination support
- 🚀 CORS enabled for web applications

## API Usage

### Query Parameters

- `languages` (string): Comma-separated list of programming languages (e.g., `javascript,python,go`)
- `minStars` (number): Minimum number of repository stars (e.g., `100`)
- `maxComments` (number): Maximum number of issue comments (e.g., `5`)
- `unassignedOnly` (boolean): Only show unassigned issues (set to `true`)
- `labels` (string): Comma-separated list of labels (e.g., `bug,enhancement`)
- `page` (number): Page number for pagination (default: `1`)
- `limit` (number): Number of results per page (default: `20`)

### Example Requests

```bash
# Get all JavaScript issues with at least 500 stars
curl "https://your-api-gateway-url.amazonaws.com/issues?languages=javascript&minStars=500"

# Get unassigned Python issues with less than 3 comments
curl "https://your-api-gateway-url.amazonaws.com/issues?languages=python&unassignedOnly=true&maxComments=3"

# Get paginated results
curl "https://your-api-gateway-url.amazonaws.com/issues?page=2&limit=10"
```

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "Issue": {
        "issue_url": "https://github.com/owner/repo/issues/123",
        "issue_title": "Add documentation for feature X",
        "issue_repo": {
          "repo_name": "awesome-repo",
          "repo_desc": "An awesome open source project",
          "repo_stars": 1500,
          "repo_langs": {
            "Nodes": [
              { "repo_prog_language": "JavaScript" }
            ]
          }
        },
        "Comments": {
          "issue_comment_count": 2
        },
        "Assignees": {
          "issue_assignees_count": 0
        }
      }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## Deployment

### Prerequisites

- AWS Account
- AWS CLI configured
- IAM role with Lambda execution permissions

### Step 1: Build the Lambda Function

```bash
cd apps/lambda-api
npm install
npm run build
npm run package
```

This creates a `lambda.zip` file ready for deployment.

### Step 2: Deploy to AWS Lambda

#### Option A: Using AWS Console

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Configure:
   - **Function name**: `good-first-issues-api`
   - **Runtime**: Node.js 20.x
   - **Architecture**: x86_64
5. Upload `lambda.zip`
6. Set handler to `handler.handler`
7. Configure timeout to 30 seconds (recommended)
8. Add environment variables if needed

#### Option B: Using AWS CLI

```bash
# Create the function
aws lambda create-function \
  --function-name good-first-issues-api \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler handler.handler \
  --zip-file fileb://lambda.zip \
  --timeout 30

# Update existing function
aws lambda update-function-code \
  --function-name good-first-issues-api \
  --zip-file fileb://lambda.zip
```

#### Option C: Using AWS SAM Template (Recommended)

See `template.yaml` for infrastructure as code deployment.

### Step 3: Configure API Gateway

1. Go to API Gateway Console
2. Create a new REST API
3. Create a resource (e.g., `/issues`)
4. Add GET method
5. Integrate with Lambda function
6. Enable CORS
7. Deploy API to a stage (e.g., `prod`)

### Step 4: Test

```bash
curl "https://YOUR_API_ID.execute-api.REGION.amazonaws.com/prod/issues?languages=javascript"
```

## Environment Variables

The Lambda function can be configured with the following environment variables:

- `DATA_URL`: Override the default good first issues data source (optional)

## Performance Considerations

- The function fetches fresh data on each invocation
- Consider adding caching with Amazon ElastiCache or DynamoDB for better performance
- Current cold start time: ~1-2 seconds
- Warm execution time: ~200-500ms

## Monitoring

Monitor your Lambda function using:
- AWS CloudWatch Logs
- AWS CloudWatch Metrics
- AWS X-Ray for distributed tracing

## Cost Estimation

With AWS Lambda free tier:
- First 1M requests/month: Free
- 400,000 GB-seconds of compute time: Free

Estimated cost for 100K requests/month: ~$0.20-$0.50

## Local Development

To test locally, you can create a test event:

```typescript
const testEvent = {
  httpMethod: 'GET',
  queryStringParameters: {
    languages: 'javascript',
    minStars: '100'
  }
};

handler(testEvent).then(console.log);
```

## Support

For issues or questions, please open an issue in the repository.

