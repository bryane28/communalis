# Communalis Backend (NestJS)

Un backend NestJS pour la gestion des utilisateurs, élèves, notes et messages, avec authentification JWT, upload d'avatars, fichiers statiques et rate limiting.

## Prérequis

- Node.js 18+
- npm 9+
- MongoDB (local ou Atlas)

## Installation

```bash
npm install
```

## Configuration (.env)

Créez un fichier `.env` à la racine:

```
MONGODB_URI=<votre_uri_mongodb>
JWT_SECRET=<votre_secret_jwt>
PORT=3000
# Liste d'origines CORS autorisées, séparées par des virgules
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

Le module `ConfigModule.forRoot({ isGlobal: true })` charge ces variables.
`CORS_ORIGINS` est optionnel; par défaut `http://localhost:3000` et `http://localhost:4200` sont autorisés (voir `src/main.ts`).

## Lancement

```bash
npm run start:dev   # mode watch
npm run start       # dev simple
npm run start:prod  # production
```

L'API est exposée sous le préfixe `/api` (voir `src/main.ts`).

## Documentation Swagger

Accédez à: `http://localhost:3000/api/docs`

Dans l'UI Swagger, cliquez sur le bouton "Authorize" et collez votre JWT dans le champ `bearer` sous la forme `Bearer <token>`.

## Authentification & JWT

Endpoints principaux:

- `POST /api/auth/register` — inscription simple.
- `POST /api/auth/login` — retourne `{ access_token, user }`.
- `POST /api/auth/request-otp` — demande d'OTP par email.
- `POST /api/auth/verify-otp` — vérifie l'OTP.
- `POST /api/auth/reset-password` — réinitialisation via OTP.
- `POST /api/auth/register/initiate` et `POST /api/auth/register/complete` — flux en deux étapes.

Exemple `login` (Body):

```
{
  "email": "formateur1@example.com",
  "motDePasse": "StrongPassw0rd!"
}
```

Utilisez ensuite `Authorization: Bearer <access_token>` pour les routes protégées.

## Rôles et accès

- **admin**: gestion complète des utilisateurs, accès global en lecture.
- **formateur**: CRUD élèves et notes, messages, lecture sélective selon rattachements.
- **parent**: lecture des élèves/notes rattachés, messages, suppression limitée.

### Tableau récapitulatif rôles → routes

| Ressource / Action                 | Admin | Formateur | Parent |
|------------------------------------|:-----:|:---------:|:------:|
| Users: GET /api/users              |  Yes  |    No     |   No   |
| Users: GET /api/users/:id          |  Yes  |    Yes    |   No   |
| Users: POST /api/users             |  Yes  |    No     |   No   |
| Users: PUT /api/users/:id          |  Yes  |    No     |   No   |
| Users: DELETE /api/users/:id       |  Yes  |    No     |   No   |
| Users: POST /api/users/:id/avatar  |  Yes  |    Yes    |  Yes   |
| Users: DELETE /api/users/:id/avatar|  Yes  |    Yes    |  Yes   |
| Students: GET /api/students        |  Yes  |    Yes    |   No   |
| Students: GET /api/students/:id    |  Yes  |    Yes    |  Yes   |
| Students: POST /api/students       |  No   |    Yes    |   No   |
| Students: PUT /api/students/:id    |  No   |    Yes    |   No   |
| Students: DELETE /api/students/:id |  No   |    Yes    |   No   |
| Students: POST /:id/assign-formateur | Yes |    Yes    |   No   |
| Students: POST /:id/assign-parent  |  Yes  |    Yes    |   No   |
| Notes: GET /api/notes              |  Yes  |    Yes    |  Yes   |
| Notes: GET /api/notes/:id          |  Yes  |    Yes    |  Yes   |
| Notes: POST /api/notes             |  No   |    Yes    |   No   |
| Notes: PUT /api/notes/:id          |  No   |    Yes    |   No   |
| Notes: DELETE /api/notes/:id       |  No   |    Yes    |   No   |
| Messages: GET /api/messages        |  Yes  |    Yes    |  Yes   |
| Messages: GET /api/messages/:id    |  Yes  |    Yes    |  Yes   |
| Messages: POST /api/messages       |  No   |    Yes    |  Yes   |
| Messages: PUT /api/messages/:id    |  No   |    Yes    |  Yes   |
| Messages: DELETE /api/messages/:id |  Yes  |    No     |   No   |

## Conventions API (Swagger)

- **Pagination standard**
  - Format de réponse des listes: `{ data, meta }`.
  - `meta` suit le schéma `MetaDoc` avec:
    - `page`, `limit`, `total`, `totalPages`.
  - Exemple:
    ```json
    {
      "data": [ /* éléments */ ],
      "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
    }
    ```

- **Réponses standardisées**
  - `MessageResponse`: `{ "message": "..." }` (utilisé pour les DELETE et opérations simples).
  - `AvatarResponse`: `{ "message": "...", "avatarUrl": "/uploads/avatars/xxx.png" }` (upload avatar).

- **Schémas réutilisables via $ref**
  - Les réponses objet utilisent des modèles réutilisables référencés par `$ref`:
    - `UserDoc`, `StudentDoc`, `NoteDoc`, `MessageDoc`.
  - Les DTO d'entrée sont typés via `@ApiBody({ type: ... })` (ex: `CreateUserDto`, `UpdateUserDto`, etc.).
  - Les listes exposent `data: { $ref: <Doc> }[]` et `meta: { $ref: MetaDoc }`.

### Auth

- **Entrées typées**: tous les endpoints Auth utilisent `@ApiBody({ type: ... })` avec leurs DTO (`RegisterDto`, `LoginDto`, `RequestOtpDto`, `VerifyOtpDto`, `ResetPasswordDto`, `RegisterInitiateDto`, `RegisterCompleteDto`).
- **Schémas de sortie réutilisables**:
  - `LoginResponseDoc`: `{ access_token, user: UserDoc }` pour `POST /auth/login`.
  - `RegisterResponseDoc`: `{ message, user: UserDoc }` pour `POST /auth/register` et `POST /auth/register/complete`.
  - `OtpRequestResponseDoc`: `{ message, email, code, expiresAt }` pour `POST /auth/request-otp` et `POST /auth/register/initiate`.
  - Réponses message-only: `MessageResponse` pour `POST /auth/verify-otp` et `POST /auth/reset-password`.

## Endpoints principaux (aperçu)

- **Users** (`/api/users`)
  - `GET /` (admin) — filtres: `nom, prenom, email, role, page, limit`.
  - `GET /:id` (admin, formateur)
  - `POST /` (admin)
  - `PUT /:id` (admin)
  - `DELETE /:id` (admin)
  - `POST /:id/avatar` (admin, formateur, parent) — form-data `file`.

- **Students** (`/api/students`)
  - `GET /` (admin, formateur) — filtres: `nom, prenom, formateurId, parentId, page, limit`.
  - `GET /:id` (admin, formateur, parent)
  - `POST /` (formateur)
  - `PUT /:id` (formateur)
  - `DELETE /:id` (formateur)
  - `POST /:id/assign-formateur` (admin, formateur)
  - `POST /:id/assign-parent` (admin, formateur)

- **Notes** (`/api/notes`)
  - `GET /` (admin, formateur, parent) — filtres: `studentId, formateurId, matiere, minNote, maxNote, page, limit`.
  - `GET /:id` (admin, formateur, parent)
  - `POST /` (formateur)
  - `PUT /:id` (formateur)
  - `DELETE /:id` (formateur)

- **Messages** (`/api/messages`)
  - `GET /` (admin, formateur, parent) — filtres: `senderId, receiverId, content, page, limit`.
  - `GET /:id` (admin, formateur, parent)
  - `POST /` (formateur, parent)
  - `PUT /:id` (formateur, parent)
  - `DELETE /:id` (admin)

## Postman

- Collection: `postman/communalis.postman_collection.json`
- Environnement: `postman/communalis.postman_environment.json` (baseUrl = `http://localhost:3000/api`)
- Scripts inclus:
  - Après `Auth > Login`, `{{token}}` est mis à jour automatiquement.
  - Lors des créations, `{{userId}}`, `{{studentId}}`, `{{noteId}}`, `{{messageId}}` sont renseignés automatiquement.

### Exemples rapides

- Liste des utilisateurs (token admin requis):

```
GET {{baseUrl}}/users?page=1&limit=10
Authorization: Bearer {{token}}
```

- Upload avatar:

```
POST {{baseUrl}}/users/{{userId}}/avatar
Authorization: Bearer {{token}}
Body: form-data, key "file" (type Fichier)
```

Les fichiers sont servis depuis `/uploads` (voir `ServeStaticModule`), ex: `http://localhost:3000/uploads/avatars/<fichier>`.

## Rate Limiting

Activé globalement avec `@nestjs/throttler` : 100 requêtes / 60s.

- Configuration dans `src/app.module.ts` via `ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }])` et guard global `ThrottlerGuard`.
- Possibilité d'utiliser `@Throttle(ttl, limit)` par route et `@SkipThrottle()` pour exclure.

## Upload d'avatars (Sharp)

- Validation des mimetypes: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- Redimensionnement max 512x512, rotation EXIF corrigée.
- Le format d'origine est conservé (GIF converti en PNG). Voir `UsersController.uploadAvatar()`.

## Tests

```bash
npm run test       # unit
npm run test:e2e   # e2e
npm run test:cov   # couverture
```

## Dépannage rapide

- 401/403: vérifier le rôle exigé par la route (`@Roles(...)`) et le token (`/auth/login`).
- 400 Validation: envoyer un JSON valide (Body raw JSON, `Content-Type: application/json`).
- 429: rate limit atteint; attendre 60s.

---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
