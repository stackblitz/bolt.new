// app/routes/auth.callback.tsx

import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = createClient(request);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the home page after successful authentication
  return redirect('/', { headers });
}
