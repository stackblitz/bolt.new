import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createCookie } from "@remix-run/node";
import { useState, useEffect } from "react";
import type { NetlifyOAuthResponse } from "~/types/netlify";

type LoaderData = {
  status: "waiting" | "success" | "error";
  message?: string;
};

const netlifyTokenCookie = createCookie("netlify_token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60, // 30 days
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  
  if (code && state) {
    // Store code in cookie and redirect to clean URL
    const session = {
      pendingCode: code,
      pendingState: state
    };

    // Redirect to the same URL without query parameters
    return redirect(url.pathname, {
      headers: {
        "Set-Cookie": await netlifyTokenCookie.serialize(session)
      }
    });
  }

  // Check for pending code in cookie
  const session = await netlifyTokenCookie.parse(request.headers.get("Cookie")) || {};
  
  if (session.pendingCode) {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code: session.pendingCode,
        client_id: process.env.VITE_NETLIFY_CLIENT_ID || "",
        client_secret: process.env.NETLIFY_CLIENT_SECRET || "",
        redirect_uri: `${url.origin}/connect/netlify`
      });

      const response = await fetch("https://api.netlify.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`Netlify responded with ${response.status}`);
      }

      const data = await response.json() as NetlifyOAuthResponse;
      
      if (!data.access_token) {
        throw new Error("Invalid token response");
      }

      // Clear pending code and store the token
      delete session.pendingCode;
      delete session.pendingState;
      session.access_token = data.access_token;

      return json<LoaderData>(
        { status: "success" },
        { 
          headers: {
            "Set-Cookie": await netlifyTokenCookie.serialize(session)
          }
        }
      );
    } catch (error) {
      // Clear pending code on error
      delete session.pendingCode;
      delete session.pendingState;

      return json<LoaderData>(
        { 
          status: "error",
          message: error instanceof Error ? error.message : "Failed to connect"
        },
        {
          headers: {
            "Set-Cookie": await netlifyTokenCookie.serialize(session)
          }
        }
      );
    }
  }

  return json<LoaderData>({ status: "waiting" });
};

export default function ConnectNetlify() {
  const { status, message } = useLoaderData<typeof loader>();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 p-8 rounded-lg text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <img src="data:image/svg+xml,%3csvg%20width='29'%20height='38'%20viewBox='0%200%2029%2038'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M16.7883%2033.392C14.1711%2033.392%2011.6015%2032.4232%2010.1264%2030.3402L9.6061%2032.7968L0%2037.992L1.03702%2032.7968L8.03267%200.5H16.5979L14.1235%2011.8838C16.1221%209.6555%2017.9779%208.83199%2020.3571%208.83199C25.4963%208.83199%2028.9224%2012.2714%2028.9224%2018.5688C28.9224%2025.06%2024.9728%2033.392%2016.7883%2033.392ZM20.0716%2020.4096C20.0716%2023.413%2017.9779%2025.6897%2015.2655%2025.6897C13.7428%2025.6897%2012.3629%2025.1084%2011.4588%2024.0912L12.7911%2018.1328C13.7904%2017.1155%2014.9325%2016.5342%2016.2648%2016.5342C18.311%2016.5342%2020.0716%2018.0844%2020.0716%2020.4096Z'%20fill='url(%23paint0_linear_3732_3321)'/%3e%3cdefs%3e%3clinearGradient%20id='paint0_linear_3732_3321'%20x1='14.4612'%20y1='0.5'%20x2='14.4612'%20y2='37.992'%20gradientUnits='userSpaceOnUse'%3e%3cstop%20stop-color='%23D7D7D7'/%3e%3cstop%20offset='1'%20stop-color='%23595959'/%3e%3c/linearGradient%3e%3c/defs%3e%3c/svg%3e" alt="Bolt" className="w-8 h-8" />
          {status === "success" ? (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : status === "error" ? (
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          <img src="data:image/svg+xml,%3csvg%20width='48'%20height='43'%20viewBox='0%200%2048%2043'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_3732_3326)'%3e%3cpath%20d='M12.975%2035.7692H12.525L10.275%2033.5204V33.0706L13.725%2029.6224H16.125L16.4625%2029.9598V32.3585L12.975%2035.7692Z'%20fill='%2305BDBA'/%3e%3cpath%20d='M10.275%2010.17V9.72026L12.525%207.47144H12.975L16.425%2010.9196V13.3184L16.125%2013.6182H13.725L10.275%2010.17Z'%20fill='%2305BDBA'/%3e%3cpath%20d='M30.1875%2028.4604H26.8875L26.625%2028.198V20.4771C26.625%2019.0903%2026.1%2018.0408%2024.45%2018.0034C23.5875%2017.9659%2022.6125%2018.0034%2021.6%2018.0408L21.45%2018.1908V28.1606L21.1875%2028.4229H17.8875L17.625%2028.1606V15.0424L17.8875%2014.78H25.3125C28.2%2014.78%2030.525%2017.1038%2030.525%2019.9898V28.198L30.1875%2028.4604Z'%20fill='white'/%3e%3cpath%20d='M13.425%2023.5131H0.2625L0%2023.2507V19.9524L0.2625%2019.6901H13.425L13.6875%2019.9524V23.2507L13.425%2023.5131Z'%20fill='%2305BDBA'/%3e%3cpath%20d='M47.7375%2023.5131H34.575L34.3125%2023.2507V19.9524L34.575%2019.6901H47.7375L48%2019.9524V23.2507L47.7375%2023.5131Z'%20fill='%2305BDBA'/%3e%3cpath%20d='M22.0875%2010.6572V0.762363L22.3875%200.5H25.6875L25.95%200.762363V10.6197L25.6875%2010.8821H22.3875L22.0875%2010.6572Z'%20fill='%2305BDBA'/%3e%3cpath%20d='M22.0875%2042.4407V32.5833L22.35%2032.321H25.65L25.9125%2032.5833V42.4407L25.65%2042.7031H22.35L22.0875%2042.4407Z'%20fill='%2305BDBA'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_3732_3326'%3e%3crect%20width='48'%20height='42.3529'%20fill='white'%20transform='translate(0%200.5)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e" alt="Netlify" className="w-8 h-8" />
        </div>
        <h2 className="text-white text-xl">
          {status === "success" 
            ? "Netlify successfully connected" 
            : status === "error"
            ? "Connection failed"
            : "Connecting to Netlify..."}
        </h2>
        {status === "success" ? (
          <p className="text-gray-400">
            You can close this window or it will automatically close in {countdown} seconds.
          </p>
        ) : status === "error" ? (
          <p className="text-red-400">{message}</p>
        ) : null}
      </div>
    </div>
  );
} 