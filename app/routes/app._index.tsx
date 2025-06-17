import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Button,
  Link,
  Frame,
  Banner
} from "@shopify/polaris";
import VideoFacade from "../components/VideoFacade";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({ 
    shopOrigin: new URL(request.url).searchParams.get("shop") || ""
  });
};

export default function Index() {
  const { shopOrigin } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Frame>
      <Page title="Timedify: Content Scheduler">

        <BlockStack gap="500">
          {/* Content Block 1: Timedify Content Scheduler */}
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="500">
                  <Text as="p" variant="bodyMd">
                    Schedule content and promotions to display automatically and improve store engagement
                  </Text>
                  <Text as="p">
                    Timed Content allows merchants to display text, images, videos, buttons, and custom HTML based on a set schedule. 
                    You can easily define start and end dates for each content block, ensuring that promotional campaigns, 
                    announcements, or seasonal updates appear exactly when needed. The app also offers optional countdown 
                    timers to build urgency around upcoming or ending offers. Timed Content helps merchants streamline store 
                    management by automating time-sensitive updates without manual intervention.
                  </Text>
                  <Button onClick={() => window.open(`https://${shopOrigin}/admin/themes/current/editor?section_id=apps`, '_blank')}>Go to Theme Editor</Button>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
          


          {/* Content Block 2: How to Use the Timedify App Block */}
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">How to Use the Timedify App Block</Text>
                  
                  <Text as="p">
                    Watch this video to learn how to configure the Timedify App Block:
                  </Text>
                  
                  <VideoFacade 
                    videoId="e0d7fbf98460407081bab5ad1e51e43d" 
                    videoType="loom"
                    loomSid="cddd7a35-fee9-4e98-8d1f-f224aca793e4"
                    title="How to Use the Timedify App Block"
                  />
                  
                  <Text as="p">
                    Once the App Block is added, configure it to display dynamic, scheduled content with these steps:
                  </Text>
                  
                  <BlockStack gap="400">
                    <Text as="p">
                      <strong>1. Set the Schedule</strong><br/>
                      Control when your content is visible by setting specific dates or times.
                    </Text>
                    
                    <Text as="p">
                      <strong>2. Add Content</strong><br/>
                      Include text, images, videos, or custom HTML to showcase in the block.
                    </Text>
                    
                    <Text as="p">
                      <strong>3. Choose Element Order</strong><br/>
                      Arrange the content elements in your preferred sequence.
                    </Text>
                    
                    <Text as="p">
                      <strong>4. Enable Countdown</strong><br/>
                      Activate a countdown timer for time-sensitive promotions or events.
                    </Text>
                    
                    <Text as="p">
                      <strong>5. Customize Colors and Alignment</strong><br/>
                      Adjust the block's appearance to match your store's branding.
                    </Text>
                  </BlockStack>
                  
                  <Text as="p">
                    Preview your changes in the Theme Editor and test the block on your store's frontend to ensure everything works as expected.
                  </Text>
                  
                  <Button onClick={() => window.open(`https://${shopOrigin}/admin/themes/current/editor`, '_blank')}>Go to Theme Editor</Button>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>

          {/* Content Block 3: How to Add the Timedify App Block */}
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">How to Add the Timedify App Block</Text>
                  
                  <Text as="p">
                    Follow these steps to add the Timedify App Block to your theme:
                  </Text>
                  
                  <VideoFacade 
                    videoId="Tvz61ykCn-I" 
                    videoType="youtube" 
                    title="How to add the Timedify App Block"
                  />
                  
                  <BlockStack gap="400">
                    <Text as="p"><strong>Quick Setup Guide:</strong></Text>
                    <Text as="p">
                      <strong>1. Navigate to Theme Editor</strong>: Go to your Shopify admin, then Online Store → Themes → Customize.
                    </Text>
                    <Text as="p">
                      <strong>2. Select a Section</strong>: Choose where you want to display timed content (header, footer, main content, etc.).
                    </Text>
                    <Text as="p">
                      <strong>3. Add the Block</strong>: Click <strong>+ Add block</strong>, find the <strong>Timedify</strong> App Block, and add it to the section.
                    </Text>
                    <Text as="p">
                      <strong>4. Configure Settings</strong>: Adjust the block's settings (schedule, content, etc.) as needed.
                    </Text>
                    <Text as="p">
                      <strong>5. Save Changes</strong>: Click <strong>Save</strong> to apply the block to your store.
                    </Text>
                  </BlockStack>
                  
                  <Text as="p">
                    Preview your changes in the Theme Editor and test the block on your store's frontend to ensure everything works as expected.
                  </Text>
                  
                  <Button onClick={() => window.open(`https://${shopOrigin}/admin/themes/current/editor`, '_blank')}>Go to Theme Editor</Button>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    </Frame>
  );
}
