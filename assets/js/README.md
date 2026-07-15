# assets/js/supabase.js

Build UMD officiel du SDK Supabase, servi en local plutôt que depuis un CDN.

**Pourquoi en local ?** Depuis un CDN, un bloqueur de pub ou un filtrage réseau
chez le client rend `window.supabase` indéfini — et le formulaire ne peut plus
rien envoyer. Le fichier local supprime cette dépendance.

**Version actuelle : 2.110.5**

## Mettre à jour

```sh
curl -sL "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.5/dist/umd/supabase.js" \
  -o assets/js/supabase.js
```

Remplacer le numéro de version par la cible voulue, puis mettre à jour la
version indiquée ici et dans le commentaire de `index.html`.

Toujours épingler une version précise (`@2.110.5`), jamais le raccourci flottant
(`@2`) : le fichier étant versionné dans le dépôt, il doit être reproductible.

Ne pas modifier ce fichier à la main : c'est un artefact téléchargé.
