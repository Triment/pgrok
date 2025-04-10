package main

import (
	"context"

	"github.com/charmbracelet/log"

	"github.com/pgrok/pgrok/internal/conf"
	"github.com/pgrok/pgrok/internal/database"
	"github.com/pgrok/pgrok/internal/reverseproxy"
	"github.com/pgrok/pgrok/internal/sshd"
)

func startSSHServer(logger *log.Logger, sshdPort int, proxy conf.Proxy, db *database.DB, proxies *reverseproxy.Cluster) {
	logger = logger.WithPrefix("sshd")
	err := sshd.Start(
		logger,
		sshdPort,
		proxy,
		db,
		// addProxy callback
		func(principalID int64, host, forward string) {
			// Fetch principal to get rate limit
			// Use context.Background() as this likely runs in a background goroutine
			p, err := db.GetPrincipalByID(context.Background(), principalID)
			if err != nil {
				logger.Error("Failed to get principal for rate limit", "principalID", principalID, "host", host, "error", err)
				// Default to 0 (unlimited) on error.
				proxies.Set(host, forward, 0)
				return
			}
			logger.Debug("Setting proxy with rate limit", "host", host, "forward", forward, "rateLimitKBps", p.RateLimitKBps)
			proxies.Set(host, forward, p.RateLimitKBps)
		},
		// removeProxy callback
		func(host string) {
			logger.Debug("Removing proxy", "host", host)
			proxies.Remove(host)
		},
	)
	if err != nil {
		logger.Fatal("Failed to start server", "error", err)
	}
}
