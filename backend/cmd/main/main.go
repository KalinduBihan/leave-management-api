package main

import (
	"fmt"
	"log"

	"github.com/KalinduBihan/leave-management-api/config"
	"github.com/KalinduBihan/leave-management-api/pkg/database"
)

func main() {
	// Load configuration
	cfg := config.New()

	// Initialize database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	sqlDB, _ := db.DB()
	defer sqlDB.Close()

	fmt.Printf("✅ Application started on port %s\n", cfg.Server.Port)
	fmt.Printf("📊 Database connected: %s\n", cfg.Database.DBName)

	// TODO: Initialize routes and start server
}