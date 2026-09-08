/* KAMSETU deployment configuration
 * Change only KAMSETU_PRODUCTION_BACKEND when your Render backend URL is different.
 */
(function () {
    "use strict";

    const isLocal =
        ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

    const KAMSETU_PRODUCTION_BACKEND =
        "https://kamsetu-backend.onrender.com";

    window.KAMSETU_API_URL = isLocal
        ? `${window.location.protocol}//${window.location.hostname}:5000`
        : KAMSETU_PRODUCTION_BACKEND;

    window.KAMSETU_SOCKET_URL = window.KAMSETU_API_URL;
})();
