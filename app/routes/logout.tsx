import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = createClient(request);
  
  await supabase.auth.signOut();
  
  return redirect("/", {
    headers: headers,
  });
};

export const loader = () => redirect("/");