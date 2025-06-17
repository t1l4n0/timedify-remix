import { useState, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Card, Text, Button, BlockStack, Banner, InlineStack, Box } from "@shopify/polaris";
import { authenticatedFetch } from "@shopify/app-bridge-utilities";

export default function DebugPanel() {
  const appBridge = useAppBridge();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [tokenMessage, setTokenMessage] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Fetch session token
  const fetchSessionToken = async () => {
    try {
      setTokenStatus("loading");
      setTokenMessage("Token wird abgerufen...");
      
      // Get session token using App Bridge
      const token = await appBridge.getSessionToken();
      
      setSessionToken(token);
      setTokenStatus("success");
      setTokenMessage(`Erfolgreich abgerufen (${token.substring(0, 10)}...)`);
      return token;
    } catch (error) {
      console.error("Fehler beim Abrufen des Session Tokens:", error);
      setTokenStatus("error");
      setTokenMessage(`Fehler: ${(error as Error).message}`);
      return null;
    }
  };
  
  // Test token validation
  const testTokenValidation = async () => {
    try {
      setIsValidating(true);
      setValidationResult(null);
      
      // Get token if not already available
      const token = sessionToken || await fetchSessionToken();
      if (!token) {
        setValidationResult({
          success: false,
          message: "Kein Session Token verfügbar"
        });
        setIsValidating(false);
        return;
      }
      
      // Make authenticated request to validation endpoint
      const fetch = authenticatedFetch(appBridge);
      const response = await fetch("/api/debug-token");
      const data = await response.json();
      
      setValidationResult(data);
    } catch (error) {
      console.error("Fehler bei Token-Validierung:", error);
      setValidationResult({
        success: false,
        message: `Fehler: ${(error as Error).message}`
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Debug-Panel</Text>
        
        <BlockStack gap="200">
          <Text variant="bodyMd" as="p">
            Session Token Status:
          </Text>
          <InlineStack gap="200" align="space-between">
            <div>
              {tokenStatus === "idle" && <Text variant="bodyMd">Noch nicht abgerufen</Text>}
              {tokenStatus === "loading" && <Text variant="bodyMd">Wird abgerufen...</Text>}
              {tokenStatus === "success" && (
                <Text variant="bodyMd" color="success">
                  {tokenMessage}
                </Text>
              )}
              {tokenStatus === "error" && (
                <Text variant="bodyMd" color="critical">
                  {tokenMessage}
                </Text>
              )}
            </div>
            <Button onClick={fetchSessionToken} loading={tokenStatus === "loading"}>
              Session Token abrufen
            </Button>
          </InlineStack>
        </BlockStack>
        
        <BlockStack gap="200">
          <Text variant="bodyMd" as="p">
            Token-Validierung:
          </Text>
          <InlineStack gap="200" align="space-between">
            <div>
              {!validationResult && <Text variant="bodyMd">Noch nicht geprüft</Text>}
              {validationResult && (
                validationResult.success ? (
                  <Text variant="bodyMd" color="success">Validierung erfolgreich</Text>
                ) : (
                  <Text variant="bodyMd" color="critical">Validierung fehlgeschlagen</Text>
                )
              )}
            </div>
            <Button onClick={testTokenValidation} loading={isValidating}>
              Token validieren
            </Button>
          </InlineStack>
        </BlockStack>
        
        {validationResult && (
          <Box padding="400" background="bg-surface-active" borderWidth="025" borderRadius="200" borderColor="border">
            <pre style={{ margin: 0, overflow: "auto" }}>
              <code>
                {JSON.stringify(validationResult, null, 2)}
              </code>
            </pre>
          </Box>
        )}
        
        {tokenStatus === "success" && (
          <Banner title="Session Token aktiv" status="success">
            <p>Die Session-Token-Authentifizierung ist korrekt eingerichtet.</p>
          </Banner>
        )}
      </BlockStack>
    </Card>
  );
}
