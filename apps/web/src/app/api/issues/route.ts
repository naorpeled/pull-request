import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_API_URL = process.env.LAMBDA_API_URL;
const FALLBACK_DATA_URL = 'https://raw.githubusercontent.com/iedr/goodfirstissues/master/backend/data.json';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  try {
    // If Lambda URL is configured, use it
    if (LAMBDA_API_URL) {
      const url = new URL(LAMBDA_API_URL);
      searchParams.forEach((value, key) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString());
      const data = await response.json();
      
      return NextResponse.json(data);
    }

    // Otherwise, fetch directly and filter in Next.js
    const response = await fetch(FALLBACK_DATA_URL);
    const allIssues = await response.json();

    // Apply filters
    let filteredIssues = allIssues;

    const languages = searchParams.get('languages')?.split(',').filter(Boolean);
    if (languages && languages.length > 0) {
      filteredIssues = filteredIssues.filter((item: any) => {
        const repoLanguages = item.Issue.issue_repo.repo_langs.Nodes.map(
          (node: any) => node.repo_prog_language
        );
        return languages.some((lang) => 
          repoLanguages.some((repoLang: string) => 
            repoLang.toLowerCase() === lang.toLowerCase()
          )
        );
      });
    }

    const minStars = searchParams.get('minStars');
    if (minStars) {
      filteredIssues = filteredIssues.filter(
        (item: any) => item.Issue.issue_repo.repo_stars >= parseInt(minStars, 10)
      );
    }

    const maxComments = searchParams.get('maxComments');
    if (maxComments) {
      filteredIssues = filteredIssues.filter(
        (item: any) => item.Issue.Comments.issue_comment_count <= parseInt(maxComments, 10)
      );
    }

    const unassignedOnly = searchParams.get('unassignedOnly');
    if (unassignedOnly === 'true') {
      filteredIssues = filteredIssues.filter(
        (item: any) => item.Issue.Assignees.issue_assignees_count === 0
      );
    }

    // Sort by stars
    filteredIssues.sort(
      (a: any, b: any) => b.Issue.issue_repo.repo_stars - a.Issue.issue_repo.repo_stars
    );

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedIssues,
      meta: {
        total: filteredIssues.length,
        page,
        limit,
        totalPages: Math.ceil(filteredIssues.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

