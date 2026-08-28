import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const googleConfigured =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    process.env.GOOGLE_CLIENT_ID !== "google-client-id" &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
    process.env.GOOGLE_CLIENT_SECRET !== "google-client-secret";

  const githubConfigured =
    Boolean(process.env.GITHUB_CLIENT_ID) &&
    process.env.GITHUB_CLIENT_ID !== "github-client-id" &&
    Boolean(process.env.GITHUB_CLIENT_SECRET) &&
    process.env.GITHUB_CLIENT_SECRET !== "github-client-secret";

  return NextResponse.json({
    google: googleConfigured,
    github: githubConfigured
  });
}
