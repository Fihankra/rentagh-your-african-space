REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_property_owner_meta() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.count_properties_by_category() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_properties_by_category() TO anon, authenticated;