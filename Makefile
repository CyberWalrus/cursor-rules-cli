.PHONY: build build-all test clean install

# Версия из git tag или dev
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TIME := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Флаги для сборки
LDFLAGS := -X 'main.version=$(VERSION)' -X 'main.buildTime=$(BUILD_TIME)' -X 'main.gitCommit=$(GIT_COMMIT)'

# Платформы для сборки
PLATFORMS := linux/amd64 linux/arm64 darwin/amd64 darwin/arm64 windows/amd64 windows/arm64

# Имя бинарного файла
BINARY_NAME := cursor-rules-cli

build:
	@echo "Building $(BINARY_NAME)..."
	@go build -ldflags "$(LDFLAGS)" -o bin/$(BINARY_NAME) ./cmd/cursor-rules-cli

build-all:
	@echo "Building for all platforms..."
	@mkdir -p bin
	@for platform in $(PLATFORMS); do \
		GOOS=$${platform%/*} \
		GOARCH=$${platform#*/} \
		go build -ldflags "$(LDFLAGS)" \
			-o bin/$(BINARY_NAME)-$${platform%/*}-$${platform#*/}$$(if [ $${platform%/*} = windows ]; then echo .exe; fi) \
			./cmd/cursor-rules-cli; \
	done
	@echo "Build complete. Binaries are in bin/"

test:
	@echo "Running tests..."
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-unit:
	@echo "Running unit tests..."
	@go test -v -short ./...

test-integration:
	@echo "Running integration tests..."
	@go test -v -tags=integration ./...

clean:
	@echo "Cleaning..."
	@rm -rf bin coverage.out coverage.html
	@go clean

install: build
	@echo "Installing $(BINARY_NAME)..."
	@cp bin/$(BINARY_NAME) /usr/local/bin/$(BINARY_NAME)
	@echo "Installed to /usr/local/bin/$(BINARY_NAME)"

lint:
	@echo "Running linters..."
	@golangci-lint run ./... || echo "golangci-lint not installed, skipping"

.DEFAULT_GOAL := build

