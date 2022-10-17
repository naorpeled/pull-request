import { graphql as GithubGraphQLClient } from '@octokit/graphql';

(async () => {
  const response = await GithubGraphQLClient(`
  {
    search(
      query: "is:open label:good-first-issue -label:duplicate,wontfix -linked:pr created:>2022-10-01 comments:<10 no:assignee"
      type: ISSUE
      first: 100
    ) {
      issueCount
      pageInfo {
        endCursor
        startCursor
      }
      edges {
        node {
          ... on Issue {
            number
            title
            body
            lastEditedAt
            labels(first: 100) {
              edges {
                node {
                  name
                }
              }
            }
            repository {
              url
              stargazerCount
              languages(first: 100) {
                nodes {
                  name
                }
              }
              forkCount
            }
          }
        }
      }
    }
  }
`);

})();
