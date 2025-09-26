// Cliente REST para D1 desde Vercel
export class D1RestClient {
  private accountId: string;
  private databaseId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.databaseId = process.env.CLOUDFLARE_DATABASE_ID!;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}`;

    if (!this.accountId || !this.databaseId || !this.apiToken) {
      throw new Error(
        'Missing Cloudflare D1 credentials. Check your .env.local file:\n' +
        '- CLOUDFLARE_ACCOUNT_ID\n' +
        '- CLOUDFLARE_DATABASE_ID\n' +
        '- CLOUDFLARE_API_TOKEN'
      );
    }
    
    console.log('🔌 Connecting to Cloudflare D1 database:', this.databaseId.substring(0, 8) + '...');
  }

  private async makeRequest(endpoint: string, body: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`D1 API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async query(sql: string, params: any[] = []) {
    const response = await this.makeRequest('/query', {
      sql,
      params,
    });

    if (!response.success) {
      throw new Error(`D1 Query Error: ${JSON.stringify(response.errors)}`);
    }

    return response.result[0];
  }

  async execute(sql: string, params: any[] = []) {
    const response = await this.makeRequest('/query', {
      sql,
      params,
    });

    if (!response.success) {
      throw new Error(`D1 Execute Error: ${JSON.stringify(response.errors)}`);
    }

    return response.result[0];
  }

  async batch(statements: Array<{ sql: string; params?: any[] }>) {
    const response = await this.makeRequest('/query', {
      sql: statements.map(s => s.sql).join(';'),
      params: statements.flatMap(s => s.params || []),
    });

    if (!response.success) {
      throw new Error(`D1 Batch Error: ${JSON.stringify(response.errors)}`);
    }

    return response.result;
  }

  // Adaptador para que funcione con Drizzle
  prepare(sql: string) {
    return {
      bind: (...params: any[]) => ({
        all: async () => {
          const result = await this.query(sql, params);
          return { results: result.results || [] };
        },
        first: async () => {
          const result = await this.query(sql, params);
          return result.results?.[0] || null;
        },
        run: async () => {
          const result = await this.execute(sql, params);
          return {
            success: result.success !== false,
            meta: {
              changes: result.meta?.changes || 0,
              last_row_id: result.meta?.last_row_id,
              duration: result.meta?.duration,
            },
          };
        },
      }),
    };
  }
}

// Instancia singleton
let d1Client: D1RestClient | null = null;

export function getD1Client() {
  if (!d1Client) {
    d1Client = new D1RestClient();
  }
  return d1Client;
}
