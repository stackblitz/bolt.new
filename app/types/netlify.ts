// User types
export interface NetlifyUser {
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface NetlifyUserResponse {
  user: NetlifyUser | null;
}

// OAuth types
export interface NetlifyOAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  scope?: string;
}

// Deploy types
export interface DeployResponse {
  success: boolean;
  error?: string;
  deployUrl?: string;
  siteUrl?: string;
  adminUrl?: string;
}

// API Response types
export interface NetlifyApiResponse {
  user: NetlifyUser | null;
}

// Site types
export interface NetlifySite {
  id: string;
  url: string;
  name: string;
  admin_url: string;
  // Add other site properties as needed
}

// Deployment types
export interface NetlifyDeployment {
  id: string;
  deploy_url: string;
  state: 'ready' | 'building' | 'error';
  // Add other deployment properties as needed
} 

export interface DeployRequestBody {
    files: Record<string, string>;
    siteName?: string;
  }