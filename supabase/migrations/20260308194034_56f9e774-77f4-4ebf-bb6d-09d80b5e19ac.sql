
-- Trigger: notify user when their complaint status changes
CREATE OR REPLACE FUNCTION public.notify_complaint_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (
      NEW.user_id,
      'Complaint Updated',
      'Your complaint "' || LEFT(NEW.subject, 60) || '" is now ' || REPLACE(NEW.status, '-', ' '),
      'info',
      '/my-complaints'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_complaint_status_notify
  AFTER UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_complaint_status_change();

-- Trigger: notify all users when a blog post is published
CREATE OR REPLACE FUNCTION public.notify_blog_published()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    SELECT
      p.user_id,
      'New Blog Post 📝',
      LEFT(NEW.title, 80),
      'info',
      '/blog?post=' || NEW.slug
    FROM public.profiles p;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blog_published_notify
  AFTER UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_blog_published();
