// app/routes/login.tsx

import { type ActionFunctionArgs, json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { redirect } from "react-router";
import { createClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const { supabase, headers } = createClient(request);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return json({ message: error.message }, { status: 400 });
  }
  return redirect("/", { headers });
}

export default function Component() {
  return (
    <div>
      <h1>Log in</h1>
      <Form method="POST">
        <label htmlFor="email">E-mail</label>
        <input type="email" name="email" id="email" />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <button type="submit">Log in</button>
      </Form>
    </div>
  );
}