import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { netlifyTokenCookie } from "../utils/cookies";
import type { 
  NetlifyUser, 
  NetlifySite, 
  NetlifyDeployment, 
  DeployResponse,
  NetlifyOAuthResponse 
} from "~/types/netlify";
import type { DeployRequestBody } from "~/types/netlify";

// GET request - fetch user
export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await netlifyTokenCookie.parse(cookieHeader);

  if (!token) {
    return json({ user: null });
  }

  try {
    const response = await fetch('https://api.netlify.com/api/v1/user', {
      headers: {
        'Authorization': `Bearer ${token.access_token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch user');
    const userData = await response.json();
    
    return json({ user: userData as NetlifyUser });
  } catch (error) {
    return json(
      { user: null },
      {
        headers: {
          "Set-Cookie": await netlifyTokenCookie.serialize(null),
        },
      }
    );
  }
}

// POST requests - deploy, disconnect, etc.
export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  switch (action) {
    case "disconnect":
      return handleDisconnect();
    
    case "deploy":
      return handleDeploy(request);

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
}

async function handleDisconnect() {
  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await netlifyTokenCookie.serialize(null, {
          expires: new Date(0),
        })
      }
    }
  );
}

async function handleDeploy(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await netlifyTokenCookie.parse(cookieHeader) as NetlifyOAuthResponse;
  const artifactId = request.headers.get('X-Artifact-ID');

  if (!token?.access_token) {
    return json<DeployResponse>({ 
      success: false, 
      error: "Netlify authentication required" 
    }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('Content-Type');
    if (contentType !== 'application/zip') {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const zipData = await request.arrayBuffer();
    console.log('Received ZIP size:', zipData.byteLength);

    if (zipData.byteLength === 0) {
      throw new Error('Received empty ZIP file');
    }

    const siteName = artifactId 
      ? `${artifactId}` 
      : `bolt-${Date.now()}`;

    // Create a new site
    const siteResponse = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: siteName,
        force_ssl: true
      }),
    });

    if (!siteResponse.ok) {
      throw new Error(`Failed to create site: ${await siteResponse.text()}`);
    }

    const site = await siteResponse.json() as NetlifySite;

    console.log('Deploying ZIP file:', {
      siteId: site.id,
      zipSize: zipData.byteLength
    });

    const zipBlob = new Blob([zipData], { type: 'application/zip' });

    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.access_token}`,
        "Content-Type": "application/zip",
        "Content-Length": zipBlob.size.toString()
      },
      body: zipBlob
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      console.error('Deploy response:', errorText);
      throw new Error(`Failed to deploy: ${errorText}`);
    }

    const deployment = await deployResponse.json() as NetlifyDeployment;

    return json<DeployResponse>({
      success: true,
      deployUrl: deployment.deploy_url,
      siteUrl: site.url,
      adminUrl: site.admin_url,
    });
  } catch (error) {
    console.error("Deployment error:", error);
    return json<DeployResponse>({
      success: false,
      error: error instanceof Error ? error.message : "Deployment failed",
    }, { status: 500 });
  }
} 