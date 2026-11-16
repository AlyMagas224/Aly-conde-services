-- storage.sql : bucket public « produits » pour les photos du catalogue (lecture publique).
-- Les téléversements se font depuis le tableau de bord Supabase (Storage) : aucune politique d'écriture n'est créée,
-- donc le public ne peut PAS ajouter ni supprimer de fichiers.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produits', 'produits', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
