export function getHostname() {
  const context = Netlify.env.get("CONTEXT");
  return context === "production"
    ? Netlify.env.get("URL")
    : context === "dev"
      ? `http://localhost:${Netlify.env.get("PORT") ?? 8888}`
      : (Netlify.env.get("DEPLOY_PRIME_URL") ?? Netlify.env.get("URL"));
}
