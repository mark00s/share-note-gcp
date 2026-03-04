# =============================================================================
# Share Note GCP - Makefile
# =============================================================================

.PHONY: build-backend help

# Default target
.DEFAULT_GOAL := help

# Environment file path
ENV_FILE := env.sh

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'


build-backend: ## Build the backend Docker image using docker buildx bake
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo ""; \
		echo "ERROR: $(ENV_FILE) file not found!"; \
		echo ""; \
		echo "Please create a env.sh file based on env.example.sh" \
		exit 1; \
	fi
	@echo "Loading environment variables from $(ENV_FILE)..."
	@set -a && . ./$(ENV_FILE) && set +a && \
		echo "Building share-note-gcp-backend..." && \
		docker buildx bake share-note-gcp-backend
