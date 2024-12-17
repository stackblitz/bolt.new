import { useSearchParams } from "@remix-run/react";

export default function AuthError() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div>
      <h1>Authentication Error</h1>
      {error && <p>Error: {error}</p>}
      <a href="/auth">Back to Sign In</a>
    </div>
  );
}
