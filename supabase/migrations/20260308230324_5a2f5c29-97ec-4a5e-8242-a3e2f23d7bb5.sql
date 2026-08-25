SELECT cron.schedule(
  'due-date-reminder-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://zdqiujpeewtyhtcqhdcj.supabase.co/functions/v1/due-date-reminder',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkcWl1anBlZXd0eWh0Y3FoZGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTY0ODAsImV4cCI6MjA4NjIzMjQ4MH0.njAezeA6ikarsELTNRsDHdUefPWhyxQ0kGNPuFk8zrE"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);