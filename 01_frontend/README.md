# ShareNoteGcp

Simple frontend build using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4
that can be deployed using Firebase.

Despite being Client-sided app, it checks for Browser in case
I would like to make it SSR.

## Deployment

### Local

1. Set `public/assets/config/config.json` based on `public/assets/config/config.example.json`.
   1. Backend can be either locally deployed (`02_backend`) or CloudRun public endpoint.
2. Serve it locally, and HF coding!

```bash
bun run serve
```

### Production/Global

1. Set `public/assets/config/config.json` based on `public/assets/config/config.example.json`.
2. Backend should be set to public endpoint, i.e. CloudRun one from Tofu deployment.
3. Build App, authenticate to GCP, and push it to your firebase config. Have fun!

```bash
bun run build
gcloud auth application-default login
firebase deploy --only hosting
```
