package version

import "testing"

func TestCompareCalver(t *testing.T) {
	tests := []struct {
		name     string
		current  string
		target   string
		expected string
		wantErr  bool
	}{
		{"same version", "2025.11.7.1", "2025.11.7.1", "none", false},
		{"patch update", "2025.11.7.1", "2025.11.7.2", "patch", false},
		{"minor update", "2025.11.7.1", "2025.11.8.1", "minor", false},
		{"major update (month)", "2025.11.7.1", "2025.12.7.1", "major", false},
		{"major update (year)", "2025.11.7.1", "2026.11.7.1", "major", false},
		{"current newer", "2025.11.7.2", "2025.11.7.1", "none", false},
		{"invalid current", "invalid", "2025.11.7.1", "", true},
		{"invalid target", "2025.11.7.1", "invalid", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := CompareCalver(tt.current, tt.target)
			if (err != nil) != tt.wantErr {
				t.Errorf("CompareCalver() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && result != tt.expected {
				t.Errorf("CompareCalver() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestIsValidCalver(t *testing.T) {
	tests := []struct {
		version  string
		expected bool
	}{
		{"2025.11.7.1", true},
		{"2025.1.1.1", true},
		{"2025.12.31.999", true},
		{"2025.11.7", false},
		{"prompts/v2025.11.7.1", false},
		{"invalid", false},
	}

	for _, tt := range tests {
		t.Run(tt.version, func(t *testing.T) {
			result := IsValidCalver(tt.version)
			if result != tt.expected {
				t.Errorf("IsValidCalver(%q) = %v, want %v", tt.version, result, tt.expected)
			}
		})
	}
}

