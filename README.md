# Site web – Association BAARI « La Barre des Arides »

Site vitrine en React (Vite), construit à partir des documents officiels :
`PRESENTATION BAARI.pdf`, flyer recto et flyer verso.

## Lancer le site

```bash
npm install
npm run dev       # développement : http://localhost:5173
npm run build     # version de production dans le dossier dist/
npm run preview   # prévisualiser la version de production
```

Le dossier `dist/` peut être déposé tel quel sur n'importe quel hébergement statique
(Netlify, Vercel, OVH, hébergement mutualisé…).

## Modifier le contenu

- Tous les textes sont dans `src/data.js` (contacts, valeurs, objectifs, activités, réalisations, équipe).
- Les photos sont dans `public/images/` (extraites des PDF). Pour remplacer une photo,
  gardez le même nom de fichier ou changez le chemin dans `src/data.js`.
- Les couleurs se règlent en haut de `src/styles.css` (variables `--navy`, `--magenta`…).

## Formulaire de contact

Le formulaire ouvre la messagerie du visiteur avec un e-mail prérempli vers info@ongbaari.com
(aucun serveur nécessaire).
