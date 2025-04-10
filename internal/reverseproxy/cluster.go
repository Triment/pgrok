package reverseproxy

import (
	"net"
	"net/http"
	"net/http/httputil"
	"time"
	"github.com/pkg/errors"
	"github.com/puzpuzpuz/xsync/v2"
)

// proxyInfo holds the reverse proxy instance and its associated rate limit.
type proxyInfo struct {
	proxy         *httputil.ReverseProxy
	rateLimitKBps int // Rate limit in KB/s, 0 means unlimited
}

// Cluster contains a list of proxies identified by their hosts.
type Cluster struct {
	proxies     map[string]*proxyInfo
	proxiesLock xsync.RBMutex
}

// NewCluster returns a new Cluster.
func NewCluster() *Cluster {
	return &Cluster{proxies: make(map[string]*proxyInfo)}
}

// Get returns the proxy and its rate limit by the given host.
// It returns a boolean to indicate whether such proxy exists.
func (c *Cluster) Get(host string) (*httputil.ReverseProxy, int, bool) {
	t := c.proxiesLock.RLock()
	defer c.proxiesLock.RUnlock(t)

	info, ok := c.proxies[host]
	if !ok {
		return nil, 0, false
	}
	return info.proxy, info.rateLimitKBps, ok
}

// Set creates a new proxy pointing to the forward address for the given host
// and associates it with the given rate limit.
func (c *Cluster) Set(host, forward string, rateLimitKBps int) {
	// Create a base transport with default settings
	baseTransport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	// Create the reverse proxy
	proxy := &httputil.ReverseProxy{
		Director: func(r *http.Request) {
			// Preserve the original Host header
			r.Host = r.URL.Host
			r.URL.Scheme = "http" // Assuming internal forwarding is HTTP
			r.URL.Host = forward  // Set the target host
		},
		Transport: baseTransport, // Start with the base transport
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			// Log the error maybe?
			w.WriteHeader(http.StatusBadGateway)
			_, _ = w.Write([]byte("pgrokd proxy error: " + errors.Cause(err).Error()))
		},
	}

	info := &proxyInfo{
		proxy:         proxy,
		rateLimitKBps: rateLimitKBps,
	}

	c.proxiesLock.Lock()
	defer c.proxiesLock.Unlock()

	c.proxies[host] = info
}

// Remove removes the proxy with the given host from the cluster.
func (c *Cluster) Remove(host string) {
	c.proxiesLock.Lock()
	defer c.proxiesLock.Unlock()
	delete(c.proxies, host)
}
