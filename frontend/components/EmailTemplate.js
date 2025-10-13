import { Button, Tailwind } from "@react-email/components";
import * as React from "react";

export const EmailTemplate = ({ firstName }) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          colors: {
            brand: "#007291",
          },
        },
      },
    }}
  >
    <h1 className="text-2xl font-semibold text-gray-800">Hello, {firstName}</h1>
    <Button
      href="https://example.com"
      className="bg-brand px-3 py-2 font-medium leading-4 text-white"
    >
      Click me
    </Button>
  </Tailwind>
);
