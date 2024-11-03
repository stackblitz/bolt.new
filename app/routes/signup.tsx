import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createClient(request);
  const formData = await request.formData();
  const provider = formData.get("provider") as string;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return redirect(data.url);
}

export default function Component() {
  return (
    <div>
      <h1>Sign in</h1>
      <Form method="POST">
        <input type="hidden" name="provider" value="github" />
        <button type="submit">Sign in with GitHub</button>
      </Form>
    </div>
  );
}
