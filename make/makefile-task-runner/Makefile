.PHONY: help dev install test

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: prompts ## Start development server
	npm run dev

install: ## Install dependencies
	npm install

test: ## Run tests
	npm run test

