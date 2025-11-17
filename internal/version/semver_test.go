package version

import "testing"

func TestCompareSemver(t *testing.T) {
	tests := []struct {
		name     string
		current  string
		target   string
		expected string
		wantErr  bool
	}{
		{"same version", "1.0.0", "1.0.0", "none", false},
		{"patch update", "1.0.0", "1.0.1", "patch", false},
		{"minor update", "1.0.0", "1.1.0", "minor", false},
		{"major update", "1.0.0", "2.0.0", "major", false},
		{"current newer", "1.0.1", "1.0.0", "none", false},
		{"invalid current", "invalid", "1.0.0", "", true},
		{"invalid target", "1.0.0", "invalid", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := CompareSemver(tt.current, tt.target)
			if (err != nil) != tt.wantErr {
				t.Errorf("CompareSemver() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && result != tt.expected {
				t.Errorf("CompareSemver() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestIsValidSemver(t *testing.T) {
	tests := []struct {
		version  string
		expected bool
	}{
		{"1.0.0", true},
		{"0.4.1", true},
		{"10.20.30", true},
		{"1.0", false},
		{"v1.0.0", false},
		{"invalid", false},
	}

	for _, tt := range tests {
		t.Run(tt.version, func(t *testing.T) {
			result := IsValidSemver(tt.version)
			if result != tt.expected {
				t.Errorf("IsValidSemver(%q) = %v, want %v", tt.version, result, tt.expected)
			}
		})
	}
}

