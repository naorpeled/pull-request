import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GoodFirstIssue, FilterParams, LambdaResponse } from './types';

const GOOD_FIRST_ISSUES_URL =
  'https://raw.githubusercontent.com/iedr/goodfirstissues/master/backend/data.json';

/**
 * Fetches the good first issues data from the repository
 */
async function fetchGoodFirstIssues(): Promise<GoodFirstIssue[]> {
  try {
    const response = await fetch(GOOD_FIRST_ISSUES_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching good first issues:', error);
    throw error;
  }
}

/**
 * Filters issues based on provided parameters
 */
function filterIssues(
  issues: GoodFirstIssue[],
  filters: FilterParams
): GoodFirstIssue[] {
  return issues.filter((item) => {
    const issue = item.Issue;

    // Filter by languages
    if (filters.languages && filters.languages.length > 0) {
      const repoLanguages = issue.issue_repo.repo_langs.Nodes.map(
        (node) => node.repo_prog_language
      );
      const hasMatchingLanguage = filters.languages.some((lang) =>
        repoLanguages.some((repoLang) =>
          repoLang.toLowerCase() === lang.toLowerCase()
        )
      );
      if (!hasMatchingLanguage) return false;
    }

    // Filter by minimum stars
    if (
      filters.minStars !== undefined &&
      issue.issue_repo.repo_stars < filters.minStars
    ) {
      return false;
    }

    // Filter by maximum comments
    if (
      filters.maxComments !== undefined &&
      issue.Comments.issue_comment_count > filters.maxComments
    ) {
      return false;
    }

    // Filter by unassigned only
    if (filters.unassignedOnly && issue.Assignees.issue_assignees_count > 0) {
      return false;
    }

    // Filter by labels
    if (filters.labels && filters.labels.length > 0) {
      const issueLabels = issue.issue_labels.Nodes.map((node) =>
        node.label_name.toLowerCase()
      );
      const hasMatchingLabel = filters.labels.some((label) =>
        issueLabels.includes(label.toLowerCase())
      );
      if (!hasMatchingLabel) return false;
    }

    return true;
  });
}

/**
 * Creates a standardized Lambda response
 */
function createResponse(
  statusCode: number,
  body: object | string
): LambdaResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'OK' });
  }

  try {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};

    const filters: FilterParams = {
      languages: queryParams.languages?.split(',').filter(Boolean),
      minStars: queryParams.minStars
        ? parseInt(queryParams.minStars, 10)
        : undefined,
      maxComments: queryParams.maxComments
        ? parseInt(queryParams.maxComments, 10)
        : undefined,
      unassignedOnly: queryParams.unassignedOnly === 'true',
      labels: queryParams.labels?.split(',').filter(Boolean),
    };

    // Fetch all issues
    const allIssues = await fetchGoodFirstIssues();

    // Apply filters
    const filteredIssues = filterIssues(allIssues, filters);

    // Sort by stars (most popular first)
    const sortedIssues = filteredIssues.sort(
      (a, b) => b.Issue.issue_repo.repo_stars - a.Issue.issue_repo.repo_stars
    );

    // Apply pagination
    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '20', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIssues = sortedIssues.slice(startIndex, endIndex);

    return createResponse(200, {
      success: true,
      data: paginatedIssues,
      meta: {
        total: sortedIssues.length,
        page,
        limit,
        totalPages: Math.ceil(sortedIssues.length / limit),
      },
    });
  } catch (error) {
    console.error('Lambda error:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

