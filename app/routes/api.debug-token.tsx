import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs, HeadersArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Debug-Endpunkt zur Überprüfung des Session Tokens
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    console.log("Debug-Token Action Handler aufgerufen mit:", request.method);
    
    // CORS-Header für API-Requests setzen
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    
    // Versuche verschiedene Authentifizierungsmethoden
    try {
      // 1. Versuche zuerst App Proxy Authentifizierung (funktioniert mit Session Token)
      console.log("Versuche App Proxy Authentifizierung...");
      const appProxyAuth = await authenticate.public.appProxy(request).catch(e => {
        console.log("App Proxy Auth fehlgeschlagen:", e.message);
        return null;
      });
      
      if (appProxyAuth?.session) {
        console.log("App Proxy Auth erfolgreich für Shop:", appProxyAuth.session.shop);
        return json({
          success: true,
          message: "Session Token erfolgreich validiert (App Proxy)",
          sessionInfo: {
            shop: appProxyAuth.session.shop,
            isOnline: appProxyAuth.session.isOnline,
            expires: appProxyAuth.session.expires,
            authType: "App Proxy",
            accessScope: appProxyAuth.admin ? "Admin API" : "Storefront API"
          }
        }, { headers });
      }
      
      // 2. Versuche Admin Authentifizierung (funktioniert im Admin Embedded App)
      console.log("Versuche Admin Authentifizierung...");
      const adminAuth = await authenticate.admin(request).catch(e => {
        console.log("Admin Auth fehlgeschlagen:", e.message);
        return null;
      });
      
      if (adminAuth?.session) {
        console.log("Admin Auth erfolgreich für Shop:", adminAuth.session.shop);
        return json({
          success: true,
          message: "Session Token erfolgreich validiert (Admin)",
          sessionInfo: {
            shop: adminAuth.session.shop,
            isOnline: adminAuth.session.isOnline,
            expires: adminAuth.session.expires,
            authType: "Admin",
            accessScope: "Admin API"
          }
        }, { headers });
      }
      
      // Keine weitere Authentifizierungsmethode für öffentliche Routes
      // Hinweis: Die Shopify Remix API bietet keinen storefront-Authenticator
      // wie bei anderen Shopify-Integrationen
      
      // Keine Authentifizierungsmethode funktionierte
      console.log("Keine Authentifizierungsmethode erfolgreich");
      return json({
        success: false,
        message: "Keine gültige Session gefunden",
        error: "Session nicht vorhanden",
        note: "Direkter Aufruf im Browser unterstützt keinen Session Token. Bitte im Shopify Admin testen."
      }, { headers });
      
    } catch (authError: any) {
      console.error("Fehler bei der Authentifizierung:", authError);
      return json({
        success: false,
        message: "Authentifizierungsfehler",
        error: authError.message || "Unbekannter Authentifizierungsfehler",
        note: "Bitte sicherstellen, dass die Anfrage mit einem gültigen Session Token erfolgt"
      }, { headers });
    }
  } catch (error: any) {
    console.error("Allgemeiner Fehler bei Token-Validierung:", error);
    
    return json({
      success: false,
      message: "Fehler bei der Session-Token-Validierung",
      error: error.message || "Unbekannter Fehler"
    });
  }
}

// Standardmäßig GET-Anfragen an POST-Handler weiterleiten
export const loader = async (args: LoaderFunctionArgs) => {
  return action(args);
};

// CORS-Header für OPTIONS requests (Preflight)
export function headers({ loaderHeaders, parentHeaders }: HeadersArgs) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
