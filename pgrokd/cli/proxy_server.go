package main

import (
	"context"
	"errors" // Added
	"fmt"
	"io" // Added
	"net"
	"net/http"
	// "time" // Removed unused import

	"github.com/charmbracelet/log"
	"github.com/flamego/flamego"
	"github.com/juju/ratelimit"

	"github.com/pgrok/pgrok/internal/reverseproxy"
)

// rateLimitedConn wraps a net.Conn with rate limiting.
type rateLimitedConn struct {
	net.Conn
	reader io.Reader
	writer io.Writer
}

func (c *rateLimitedConn) Read(p []byte) (n int, err error) {
	return c.reader.Read(p)
}

func (c *rateLimitedConn) Write(p []byte) (n int, err error) {
	return c.writer.Write(p)
}

// newRateLimitedTransport creates an http.Transport that applies rate limiting.
func newRateLimitedTransport(baseTransport http.RoundTripper, rateKBps int) http.RoundTripper {
	if rateKBps <= 0 {
		return baseTransport // No limit or invalid limit, use base transport
	}

	// Ensure baseTransport is *http.Transport to access DialContext
	httpTransport, ok := baseTransport.(*http.Transport)
	if !ok {
		// If it's not *http.Transport, we can't easily wrap DialContext.
		// Log a warning and return the base transport.
		// Consider alternative approaches if this happens often.
		log.Warn("Base transport is not *http.Transport, cannot apply rate limiting", "type", fmt.Sprintf("%T", baseTransport))
		return baseTransport
	}

	// Clone the base transport to avoid modifying the original
	clonedTransport := httpTransport.Clone()

	rateBytes := float64(rateKBps * 1024) // Convert KB/s to bytes/s
	capacity := int64(rateBytes)          // Set capacity equal to rate for simplicity

	// Override DialContext
	clonedTransport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		// Use the original DialContext to establish the connection
		conn, err := httpTransport.DialContext(ctx, network, addr)
		if err != nil {
			return nil, err
		}

		// Create a rate limiter bucket
		bucket := ratelimit.NewBucketWithRate(rateBytes, capacity)

		// Wrap the connection with the rate limiter
		limitedConn := &rateLimitedConn{
			Conn:   conn,
			reader: ratelimit.Reader(conn, bucket),
			writer: ratelimit.Writer(conn, bucket),
		}
		return limitedConn, nil
	}

	return clonedTransport
}


func startProxyServer(logger *log.Logger, port int, proxies *reverseproxy.Cluster) {
	logger = logger.WithPrefix("proxy")

	f := flamego.New()
	f.Use(flamego.Recovery())
	f.Any("/{**}", func(w http.ResponseWriter, r *http.Request) {
		proxy, rateLimitKBps, ok := proxies.Get(r.Host) // Updated call
		if !ok {
			w.WriteHeader(http.StatusNotFound) // Use 404 Not Found instead of 502
			_, _ = w.Write([]byte("pgrokd: Tunnel " + r.Host + " not found"))
			return
		}

		// Apply rate limiting if necessary by replacing the transport
		if rateLimitKBps > 0 {
			logger.Debug("Applying rate limit", "host", r.Host, "limitKBps", rateLimitKBps)
			// Ensure proxy.Transport is initialized if nil (though cluster.Set should handle this)
			if proxy.Transport == nil {
				proxy.Transport = http.DefaultTransport
			}
			proxy.Transport = newRateLimitedTransport(proxy.Transport, rateLimitKBps)
		}
		// No 'else' needed here. If rateLimitKBps <= 0, newRateLimitedTransport
		// returns the original baseTransport anyway. The transport set by
		// cluster.Set is assumed to be the correct non-limited transport.

		proxy.ServeHTTP(w, r)
	})

	address := fmt.Sprintf("0.0.0.0:%d", port)
	server := &http.Server{
		Addr:    address,
		Handler: f,
		// Add timeouts for robustness? e.g., ReadTimeout, WriteTimeout
	}

	logger.Info("Proxy server listening on", "address", address)
	err := server.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Fatal("Failed to start proxy server", "error", err)
	}
}
