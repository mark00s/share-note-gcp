# Backend

## Local Development

### Prerequesites

1. `Service Account Token Creator` role in project where Firestore is deployed.

### Local deployment

1. Impersonate yourself as SA in project authorized with Firebase access.
gcloud auth application-default login --impersonate-service-account={{SA_NAME}}@{{PROJECT_NAME}}.iam.gserviceaccount.com
