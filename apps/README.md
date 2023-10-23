# Apps

This folder is related to the deployment of the website and backend of
https://ratemyopenapi.com

## Local development

Setup the local environment in the `apps/api` folder

```
cp .env.example .env
export $(grep -v '^#' .env)
```

In order to authenticate to the GCP storage bucket run:

```
gcloud auth login
```

To run the entire app locally simply run the following command:

```
npm run dev
```

### Running the API

Go to `/apps/api`

Create and export .env file

```
cp .env.example .env
export $(grep -v '^#' .env)
```

In 3 different terminals:

```
npx tsc --watch # Teminal 1, start the compiler on watch mode

node dist/server.js # Terminal 2, start the server

npx inngest-cli@latest dev -u http://localhost:3000/inngest # Terminal 3, start the Inngest server
```

### Running the web app

Go to `/apps/web`

```
npm run dev
```

(In case you're also updating the API concurrently, update the
`.env.development` file to point to the local API: `http://localhost:3000`,
otherwise it will use a deployed API)
