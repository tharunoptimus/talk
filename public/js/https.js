// if the hostname is not localhost and the protocol is not https, redirect to https
if (location.hostname !== "localhost" && location.protocol !== "https:") {
	location.replace(
		"https://" + location.hostname + location.pathname + location.search
	)
}
