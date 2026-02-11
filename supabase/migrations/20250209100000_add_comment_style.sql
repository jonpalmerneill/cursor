-- Optional per-post style: background color and Google font family
alter table public.comments
  add column if not exists background_color text,
  add column if not exists font_family text;

-- Optional: constrain to simple hex colors and safe font names (allow null)
-- No check added so we can validate in app and allow any stored value for backwards compat
