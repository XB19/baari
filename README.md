# Site web – Association BAARI « La Barre des Arides »

Site vitrine en React (Vite) avec une administration, construit à partir des documents officiels :
`PRESENTATION BAARI.pdf`, flyer recto et flyer verso.

- `src/` : le site public et l'administration (`src/admin/`)
- `server/` : le serveur Express et la connexion à PostgreSQL

## Installation

Il faut Node.js et un serveur PostgreSQL démarré sur la machine.

```bash
npm install
cp server/.env.example server/.env
```

Renseignez ensuite `PGPASSWORD` dans `server/.env`. Ce fichier contient le mot de passe de la base :
il est ignoré par git et ne doit jamais être partagé.

La base `baari`, ses tables et le contenu d'origine sont créés automatiquement au premier démarrage.

## Lancer le site

```bash
npm run dev
```

- Site public : http://localhost:5173
- Administration : http://localhost:5173/admin

L'administration ne propose que la connexion : aucun compte ne peut être créé depuis le site.

## Compte administrateur

```bash
npm run admin -- adresse@exemple.org
```

Cette commande crée le compte s'il n'existe pas, sinon elle génère un nouveau mot de passe
et déconnecte les sessions ouvertes (utile en cas d'oubli). Le mot de passe s'affiche une seule fois.
Sans adresse, le compte `admin@ongbaari.com` est utilisé.

## Docker

Il faut Docker Desktop. L'image contient le site et le serveur, et PostgreSQL tourne dans un second
conteneur : aucune installation de Node.js ou de PostgreSQL n'est nécessaire.

```bash
cp .env.example .env              # puis renseigner POSTGRES_PASSWORD
docker compose up -d --build
docker compose exec app node server/set-admin.js admin@ongbaari.com
```

- Site public : http://localhost:8080
- Administration : http://localhost:8080/admin

La troisième commande crée le compte administrateur et affiche son mot de passe une seule fois.
La base et les images envoyées sont conservées dans les volumes `db-data` et `uploads`.

```bash
docker compose logs -f app        # voir les journaux
docker compose down               # arrêter (les données sont conservées)
docker compose up -d --build      # relancer après une mise à jour
```

`docker compose down -v` supprime aussi les volumes, donc tout le contenu, les messages et les images.

## Version compilée

```bash
npm run build
npm run server
```

Le site et l'administration sont alors servis ensemble sur http://127.0.0.1:4000.

## Administration

- **Tableau de bord** : chiffres clés et derniers messages.
- **Messages** : lecture, réponse et suppression des messages du formulaire de contact.
- **Contenu du site** : accueil, mission, coordonnées, valeurs, objectifs, groupes cibles, activités,
  « Encore plus », réalisations et équipe. Le bouton **Publier** met le site à jour immédiatement.
- **Médiathèque** : envoi et suppression d'images (JPG, PNG ou WebP, 5 Mo maximum).
- **Mon compte** : changement du mot de passe.

Le contenu d'origine reste dans `src/data.js`. Il sert à remplir la base au premier démarrage,
au bouton « Contenu d'origine » et de secours si le serveur ne répond pas.

## Sauvegarde

Le contenu et les messages sont dans la base `baari`, les images envoyées dans `server/uploads/`.
Ces deux emplacements sont à sauvegarder ensemble.
