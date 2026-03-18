package database

import (
	"fmt"

	"github.com/KalinduBihan/leave-management-api/config"
	"github.com/KalinduBihan/leave-management-api/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// InitDB initializes and returns a database connection
func InitDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := cfg.Database.GetLibPQConnectionString()

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto migrate domain models
	err = db.AutoMigrate(
		&domain.User{},
		&domain.Employee{},
		&domain.Department{},
		&domain.LeaveRequest{},
		&domain.LeaveBalance{},
		&domain.AuditLog{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return db, nil
}
