// app/utils/supabase.server.ts

import { createServerClient, serialize, parse } from "@supabase/ssr";
import { type User } from '@supabase/supabase-js';

export function createClient(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    },
  );

  return {
    supabase,
    headers,
    getUser: async (): Promise<User | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  };
}
