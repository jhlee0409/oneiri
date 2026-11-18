-- 상징 리포트는 서버(service role)만 만든다. 브라우저 클라이언트는 자기 리포트를 읽기만 한다.
revoke insert, update, delete on public.analysis_reports from anon, authenticated;
