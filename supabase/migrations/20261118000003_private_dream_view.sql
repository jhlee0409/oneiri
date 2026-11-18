-- This view is consumed only by the server-side dreams route. Direct API access
-- must not bypass the route's owner/public filter through a definer-owned view.
revoke all on public.dreams_with_details from public, anon, authenticated;
grant select on public.dreams_with_details to service_role;
