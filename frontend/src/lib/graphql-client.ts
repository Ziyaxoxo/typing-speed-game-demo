const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authToken = token !== undefined ? token : (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message || 'GraphQL Operation Failed');
  }

  if (!result.data) {
    throw new Error('No data returned from GraphQL API');
  }

  return result.data;
}
