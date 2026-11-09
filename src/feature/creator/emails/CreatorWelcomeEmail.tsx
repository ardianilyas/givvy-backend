import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
  Preview,
  Tailwind,
  Section,
  Button,
} from "@react-email/components";

export interface CreatorWelcomeEmailProps {
  username: string;
}

export default function CreatorWelcomeEmail({ username = "ardian" }: CreatorWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Givvy</Preview>

      <Tailwind>
        <Body className="bg-[#f8f8f7] font-sans">
          <Container className="mx-auto my-10 max-w-[560px] bg-white px-8 py-10">

            {/* Brand */}
            <Section className="mb-12">
              <Text className="text-xl font-bold tracking-tight text-gray-950">
                <span className="text-orange-500">✳</span> Givvy
              </Text>
            </Section>

            {/* Welcome */}
            <Section className="mb-8">
              <Text className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">
                You're officially in
              </Text>

              <Text className="m-0 text-4xl font-bold leading-tight tracking-tight text-gray-950">
                Welcome to Givvy, {username}.
              </Text>

              <Text className="mt-5 text-base leading-7 text-gray-600">
                Your space is ready. Your next chapter starts here.
              </Text>
            </Section>

            <Hr className="my-8 border-gray-200" />

            {/* Main content */}
            <Section>
              <Text className="text-base leading-7 text-gray-700">
                You've got something worth sharing. We're here to help you
                turn that passion into something people can support.
              </Text>

              <Text className="text-base leading-7 text-gray-700">
                Set up your page, make it yours, and let your community
                find you.
              </Text>
            </Section>

            {/* CTA */}
            <Section className="my-10">
              <Button
                href="https://example.com/dashboard"
                className="rounded-md bg-orange-500 px-6 py-4 text-sm font-semibold text-white"
                >
                Explore your dashboard →
              </Button>
            </Section>

            {/* Closing */}
            <Section>
              <Text className="text-sm font-medium text-gray-900">
                One last thing.
              </Text>
              <Text className="text-sm leading-6 text-gray-500">
                This is your space. Build it your way.
                We're glad you're here.
              </Text>
            </Section>

            <Hr className="my-8 border-gray-200" />

            {/* Footer */}
            <Section>
              <Text className="text-xs text-gray-400">
                © {new Date().getFullYear()} Givvy. All rights reserved.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
