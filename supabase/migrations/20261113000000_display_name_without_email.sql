-- 가입 시 display_name 기본값이 이메일이라 공개 꿈·댓글 작성자명으로 이메일이 노출되던 문제 수정.
-- 1) 신규 가입: Google 프로필 이름 → 없으면 기본 닉네임
create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path = public
as $function$
begin
  insert into public.user_profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      '꿈꾸는자'
    )
  );
  return new;
end;
$function$;

-- 2) 기존 사용자: 이메일과 동일한 display_name만 같은 규칙으로 교체
update public.user_profiles p
set display_name = coalesce(
      nullif(u.raw_user_meta_data->>'full_name', ''),
      nullif(u.raw_user_meta_data->>'name', ''),
      '꿈꾸는자'
    ),
    updated_at = now()
from auth.users u
where u.id = p.id
  and p.display_name = u.email;
