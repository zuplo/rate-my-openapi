# Rate My OpenAPI

## Releasing

To release a new version run:

```
npm run release
```

## Local development

### Running the API

Go to `/apps/api`

Create and export .env file

```
cp .env.example .env
export $(grep -v '^#' .env)
```

In 3 different terminals:

Start compiler in watch mode

```
npx tsc --watch
```

Start the server

```
node dist/server.js
```

Start Inngest server

```
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

### Running the web app

Go to `/apps/web`

```
npm run dev
```

(In case you're also updating the API concurrently, update the
`.env.development` file to point to the local API: `http://localhost:3000`)
